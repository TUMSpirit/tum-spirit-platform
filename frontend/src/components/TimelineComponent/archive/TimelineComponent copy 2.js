import React, { useState, useEffect, useRef } from 'react';
import Util from './Util';
import './style.css'

const HorizontalTimeline = ({ dates, events }) => {
  const [translate, setTranslate] = useState(0);
  const [oldDateIndex, setOldDateIndex] = useState(0);
  const [newDateIndex, setNewDateIndex] = useState(0);
  const [lineLength, setLineLength] = useState(0);

  const datesContainer = useRef(null);
  const line = useRef(null);
  const fillingLine = useRef(null);
  const contentWrapper = useRef(null);

  useEffect(() => {
    if (datesContainer.current && line.current && fillingLine.current && contentWrapper.current) {
      initTimeline();
      initEvents();
    }
  }, [datesContainer, line, fillingLine, contentWrapper]);

  const initTimeline = () => {
    let left = 0;

    dates.forEach((date, i) => {
      const j = i === 0 ? 0 : i - 1;
      const distance = daydiff(dates[j], dates[i]);
      const distanceNorm = Math.min(Math.max((Math.round(distance / calcMinLapse()) + 2) * 60, 60), 200);
      left += distanceNorm;
      line.current.children[i].style.left = `${left}px`;
    });

    line.current.style.width = `${left + 60}px`;
    setLineLength(left + 60);

    Util.addClass(datesContainer.current, 'cd-h-timeline--loaded');
    selectNewDate(dates[0]);
    resetTimelinePosition('next');
  };

  const initEvents = () => {
    const navPrev = document.querySelector('.cd-h-timeline__navigation--prev');
    const navNext = document.querySelector('.cd-h-timeline__navigation--next');

    navPrev.addEventListener('click', (event) => {
      event.preventDefault();
      translateTimeline('prev');
    });

    navNext.addEventListener('click', (event) => {
      event.preventDefault();
      translateTimeline('next');
    });
  };

  const translateTimeline = (direction) => {
    const containerWidth = datesContainer.current.offsetWidth;
    let newTranslate = translate;

    if (direction) {
      newTranslate = direction === 'next' ? translate - containerWidth + 60 : translate + containerWidth - 60;
    }

    if (0 - newTranslate > lineLength - containerWidth) newTranslate = containerWidth - lineLength;
    if (newTranslate > 0) newTranslate = 0;

    line.current.style.transform = `translateX(${newTranslate}px)`;
    setTranslate(newTranslate);
  };

  const selectNewDate = (target) => {
    const newIndex = Util.getIndexInArray(dates, target);
    setOldDateIndex(newDateIndex);
    setNewDateIndex(newIndex);
    Util.removeClass(line.current.children[oldDateIndex], 'cd-h-timeline__date--selected');
    Util.addClass(line.current.children[newIndex], 'cd-h-timeline__date--selected');
    updateFilling();
  };

  const updateFilling = () => {
    if (line.current.children[newDateIndex]) {
      const dateStyle = window.getComputedStyle(line.current.children[newDateIndex], null);
      const left = parseFloat(dateStyle.getPropertyValue('left')) + parseFloat(dateStyle.getPropertyValue('width')) / 2;
      fillingLine.current.style.transform = `scaleX(${left / lineLength})`;
    }
  };

  const daydiff = (first, second) => {
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
  };

  const calcMinLapse = () => {
    const dateDistances = [];
    for (let i = 1; i < dates.length; i++) {
      const distance = daydiff(dates[i - 1], dates[i]);
      if (distance > 0) dateDistances.push(distance);
    }
    return dateDistances.length > 0 ? Math.min(...dateDistances) : 86400000;
  };

  const resetTimelinePosition = (direction) => {
    if (line.current.children[newDateIndex]) {
      const eventStyle = window.getComputedStyle(line.current.children[newDateIndex], null);
      const eventLeft = Number(eventStyle.getPropertyValue('left').replace('px', ''));
      const timelineWidth = datesContainer.current.offsetWidth;

      if ((direction === 'next' && eventLeft >= timelineWidth - translate) || (direction === 'prev' && eventLeft <= -translate)) {
        setTranslate(timelineWidth / 2 - eventLeft);
        translateTimeline(false);
      }
    }
  };

  return (
    <div className="cd-h-timeline js-cd-h-timeline">
      <div className="cd-h-timeline__dates" ref={datesContainer}>
        <div className="cd-h-timeline__line" ref={line}>
          {dates.map((date, index) => (
            <a href="#0" key={index} className="cd-h-timeline__date" onClick={() => selectNewDate(date)}>
              {date.toDateString()}
            </a>
          ))}
          <span className="cd-h-timeline__filling-line" ref={fillingLine}></span>
        </div>
      </div>
      <ul className="cd-h-timeline__navigation">
        <li>
          <a href="#0" className="cd-h-timeline__navigation--prev cd-h-timeline__navigation--inactive">Prev</a>
        </li>
        <li>
          <a href="#0" className="cd-h-timeline__navigation--next">Next</a>
        </li>
      </ul>
      <div className="cd-h-timeline__events" ref={contentWrapper}>
        {events.map((event, index) => (
          <div key={index} className="cd-h-timeline__event">{event}</div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalTimeline;
