const moment = require('moment');

function getNextSixMonthsDates(startDate, numberOfDates) {
  const dates = [];
  const date = new Date(startDate);

  for (let i = 0; i < numberOfDates; i++) {
    date.setMonth(date.getMonth() + 6); // Increment the date by 6 months
    dates.push(new Date(date)); // Store a new Date object to avoid reference issues
  }

  return dates;
}

function filterDatesAfterToday(datesArray) {
  const today = new Date(); // Get today's date

  // Filter dates that are after today's date
  const datesAfterToday = datesArray.filter(date => {
    const currentDate = new Date(date);
    return currentDate > today;
  });

  return datesAfterToday;
}

function calculateXNPV(rate, values, dates) {
  if (values.length !== dates.length) {
    throw new Error('Values and dates arrays must have the same length');
  }

  let xnpv = 0;
  const startDate = moment(dates[0]);
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const date = moment(dates[i]);
    const daysDiff = startDate.diff(date, 'days');
    const discountFactor = Math.pow((1 + rate), (daysDiff / 365));
    xnpv += value * discountFactor;
  }

  return xnpv;
}

module.exports = {getNextSixMonthsDates, filterDatesAfterToday, calculateXNPV}