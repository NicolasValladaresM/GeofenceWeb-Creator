import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import { addDays } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { es } from 'date-fns/locale';

const DateRangeSimple = ({ onInsideChange }) => {
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection',
    }
  ]);

  const current = new Date();
  const inside = current >= range[0].startDate && current <= range[0].endDate;

console.log('Valor inside', inside)

const DateChange = (item) => {
  setRange([item.selection]);
  onInsideChange({
    startDate: item.selection.startDate,
    endDate: item.selection.endDate
  });
};

  return (
    <DateRange
      locale={es}
      editableDateInputs={true}
      onChange={DateChange}
      moveRangeOnFirstSelection={false}
      ranges={range}
    />
  );
};

export default DateRangeSimple;
