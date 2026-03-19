const WAIT_BY_LEVEL = {
  none: 2,
  short: 6,
  medium: 15,
  long: 35,
};

const PEOPLE_BY_LEVEL = {
  none: 1,
  short: 4,
  medium: 10,
  long: 22,
};

function clampInt(value, min, max) {
  const rounded = Math.round(value);
  if (rounded < min) {
    return min;
  }
  if (rounded > max) {
    return max;
  }
  return rounded;
}

function slotIndex(hour) {
  return Math.max(0, Math.min(11, hour - 8));
}

function loadToWait(load) {
  return clampInt(load * 1.4, 0, 55);
}

function crowdIndex(waitMinutes, peopleCount, historicalLoad) {
  return clampInt(waitMinutes * 1.8 + peopleCount * 1.2 + historicalLoad * 0.7, 0, 100);
}

function queueStatusFromWait(waitMinutes) {
  if (waitMinutes <= 3) {
    return "none";
  }
  if (waitMinutes <= 9) {
    return "short";
  }
  if (waitMinutes <= 20) {
    return "medium";
  }
  return "long";
}

function weightedAverage(reports, selector, now) {
  if (!reports.length) {
    return 0;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const report of reports) {
    const ageMinutes = Math.max(
      1,
      Math.round((now.getTime() - new Date(report.createdAt).getTime()) / 60000),
    );
    const weight = (1 / (1 + ageMinutes / 35)) * (report.trustWeight || 1);
    weightedSum += selector(report) * weight;
    totalWeight += weight;
  }

  return totalWeight === 0 ? 0 : weightedSum / totalWeight;
}

function formatTime(date) {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatRelativeTime(date, now) {
  const diffMinutes = Math.max(0, Math.round((now.getTime() - date.getTime()) / 60000));
  if (diffMinutes === 0) {
    return "только что";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} мин назад`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  return `${diffHours} ч назад`;
}

function behaviorState(locationId, context) {
  const events = context.behaviorByLocation?.get(locationId) || [];
  const bookings = context.bookingsByLocation?.get(locationId) || [];
  const views = events.filter((item) => item.type === "view").length;
  const arrivals = events.filter((item) => item.type === "arrival").length;
  const bookingSignals =
    bookings.length + events.filter((item) => item.type === "booking").length;
  const conversion = arrivals / Math.max(1, views);
  return {
    views,
    arrivals,
    bookings: bookingSignals,
    conversion,
  };
}

function behaviorBoost(locationId, context, hoursAhead) {
  const behavior = behaviorState(locationId, context);
  const raw = behavior.views * behavior.conversion * 0.8 + behavior.bookings * 1.05;
  const decay = hoursAhead === 0 ? 1 : hoursAhead === 1 ? 0.85 : hoursAhead === 2 ? 0.7 : 0.55;
  return clampInt(raw * decay, 0, 10);
}

function buildState(location, reports, context, now, hoursAhead = 0) {
  const target = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
  const activeReports = reports
    .filter((report) => now.getTime() - new Date(report.createdAt).getTime() <= 4 * 60 * 60 * 1000)
    .slice(0, 10);
  const baselineLoad = location.hourlyLoad[slotIndex(target.getHours())] || 0;
  const baselineWait = loadToWait(baselineLoad);
  const recentWait = activeReports.length
    ? weightedAverage(activeReports, (report) => report.waitMinutes, now)
    : baselineWait;
  const recentPeople = activeReports.length
    ? weightedAverage(activeReports, (report) => report.peopleCount, now)
    : Math.max(1, Math.round(baselineLoad / 2));
  const latestWait = activeReports[0] ? activeReports[0].waitMinutes : baselineWait;
  const trend = latestWait - recentWait;
  const behavior = behaviorBoost(location.id, context, hoursAhead);

  const recentWeight = hoursAhead === 0 ? 0.68 : hoursAhead === 1 ? 0.6 : hoursAhead === 2 ? 0.48 : 0.34;
  const predictedWait = clampInt(
    recentWait * recentWeight + baselineWait * (1 - recentWeight) + trend * 0.18 + behavior,
    0,
    60,
  );
  const predictedPeople = clampInt(
    recentPeople * recentWeight + Math.max(1, baselineLoad / 2) * (1 - recentWeight) + behavior / 2,
    1,
    40,
  );

  return {
    waitMinutes: predictedWait,
    peopleCount: predictedPeople,
    crowdIndex: crowdIndex(predictedWait, predictedPeople, baselineLoad + behavior),
    queueLevel: queueStatusFromWait(predictedWait),
    atTime: formatTime(target),
  };
}

function buildPrediction(location, locationReports, allLocations, reportsByLocation, context = {}, now = new Date()) {
  const currentState = buildState(location, locationReports, context, now, 0);
  const forecast = [1, 2, 3].map((hoursAhead) => {
    const nextState = buildState(location, locationReports, context, now, hoursAhead);
    return {
      hoursAhead,
      atTime: nextState.atTime,
      predictedWaitMinutes: nextState.waitMinutes,
      crowdIndex: nextState.crowdIndex,
      queueLevel: nextState.queueLevel,
    };
  });

  const options = [
    {
      atTime: formatTime(now),
      waitMinutes: currentState.waitMinutes,
    },
    ...forecast.map((item) => ({
      atTime: item.atTime,
      waitMinutes: item.predictedWaitMinutes,
    })),
  ];
  const bestWindow = options.reduce((best, option) =>
    option.waitMinutes < best.waitMinutes ? option : best,
  );
  const behavior = behaviorState(location.id, context);

  const alternatives = allLocations
    .filter((candidate) => candidate.category === location.category && candidate.id !== location.id)
    .map((candidate) => {
      const candidateReports = reportsByLocation.get(candidate.id) || [];
      const candidateState = buildState(candidate, candidateReports, context, now, 0);
      return {
        locationId: candidate.id,
        name: candidate.name,
        address: candidate.address,
        distanceKm: candidate.distanceKm,
        waitMinutes: candidateState.waitMinutes,
        crowdIndex: candidateState.crowdIndex,
      };
    })
    .sort((left, right) => left.waitMinutes - right.waitMinutes || left.distanceKm - right.distanceKm)
    .slice(0, 2);

  const recommendation =
    alternatives[0] && alternatives[0].waitMinutes + 7 < currentState.waitMinutes
      ? `Иди в ${alternatives[0].name}: там быстрее примерно на ${currentState.waitMinutes - alternatives[0].waitMinutes} мин`
      : behavior.bookings >= 2
        ? `Есть booking demand, лучше слот ${bestWindow.atTime}`
        : `Лучшее время для визита сегодня: ${bestWindow.atTime}`;

  return {
    locationId: location.id,
    currentWaitMinutes: currentState.waitMinutes,
    crowdIndex: currentState.crowdIndex,
    currentQueueLevel: currentState.queueLevel,
    peopleCount: currentState.peopleCount,
    bestVisitTime: bestWindow.atTime,
    updatedAgo: locationReports[0]
      ? formatRelativeTime(new Date(locationReports[0].createdAt), now)
      : "Нет свежих данных",
    dataPoints: locationReports.length,
    recommendation,
    forecast,
    alternatives,
    behavior,
    updatedAt: now.toISOString(),
  };
}

function queuePayloadToMetrics(queueLevel) {
  return {
    waitMinutes: WAIT_BY_LEVEL[queueLevel] || 10,
    peopleCount: PEOPLE_BY_LEVEL[queueLevel] || 6,
  };
}

function buildSuggestedSlots(prediction) {
  const slots = [
    {
      label: "Сейчас",
      scheduledFor: formatTime(new Date()),
      predictedWaitMinutes: prediction.currentWaitMinutes,
      crowdIndex: prediction.crowdIndex,
    },
    ...prediction.forecast.map((item) => ({
      label: `через ${item.hoursAhead} ч`,
      scheduledFor: item.atTime,
      predictedWaitMinutes: item.predictedWaitMinutes,
      crowdIndex: item.crowdIndex,
    })),
  ];
  const best = slots.reduce((left, right) =>
    right.predictedWaitMinutes < left.predictedWaitMinutes ? right : left,
  );
  return slots.map((slot) => ({
    ...slot,
    recommended: slot.scheduledFor === best.scheduledFor,
  }));
}

module.exports = {
  buildPrediction,
  buildState,
  buildSuggestedSlots,
  queuePayloadToMetrics,
};
