import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import "./style.css";
import "./util.js";


const TimelineComponent = () => {
  const datesContainer = useRef(null);
  const line = useRef(null);
  const fillingLine = useRef(null);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [translate, setTranslate] = useState(0);
  const [lineLength, setLineLength] = useState(0);
  const [dateValues, setDateValues] = useState([]);
  const [minLapse, setMinLapse] = useState(0);
  const eventsMinDistance = 60;
  const eventsMaxDistance = 200;

  useEffect(() => {
    const dateElements = datesContainer.current.getElementsByClassName('cd-h-timeline__date');
    const selectedDate = datesContainer.current.getElementsByClassName('cd-h-timeline__date--selected')[0];
    const dateValues = parseDate(dateElements);
    const minLapse = calcMinLapse(dateValues);


    initTimeline(dateValues, minLapse);
    initEvents(dateElements, selectedDate);

    window.addEventListener('resize', resetTimelinePosition);

    return () => {
      window.removeEventListener('resize', resetTimelinePosition);
    };
  });

  useEffect(() => {
    setDateValues(dateValues);
    setMinLapse(minLapse);
  });

  const parseDate = (dateElements) => {
    const dateArrays = [];
    for (let i = 0; i < dateElements.length; i++) {
      const singleDate = dateElements[i].getAttribute('data-date');
      const dateComp = singleDate.split('T');

      let dayComp, timeComp;
      if (dateComp.length > 1) {
        dayComp = dateComp[0].split('/');
        timeComp = dateComp[1].split(':');
      } else if (dateComp[0].indexOf(':') >= 0) {
        dayComp = ["2000", "0", "0"];
        timeComp = dateComp[0].split(':');
      } else {
        dayComp = dateComp[0].split('/');
        timeComp = ["0", "0"];
      }
      const newDate = new Date(dayComp[2], dayComp[1] - 1, dayComp[0], timeComp[0], timeComp[1]);
      dateArrays.push(newDate);
    }
    return dateArrays;
  };

  const calcMinLapse = (dateValues) => {
    const dateDistances = [];
    for (let i = 1; i < dateValues.length; i++) {
      const distance = daydiff(dateValues[i - 1], dateValues[i]);
      if (distance > 0) dateDistances.push(distance);
    }
    return dateDistances.length > 0 ? Math.min(...dateDistances) : 86400000;
  };

  const daydiff = (first, second) => {
    return Math.round((second - first));
  };

  const initTimeline = (dateValues, minLapse) => {
    let left = 0;
    const dateElements = datesContainer.current.getElementsByClassName('cd-h-timeline__date');

    for (let i = 0; i < dateValues.length; i++) {
      const j = i === 0 ? 0 : i - 1;
      let distance = daydiff(dateValues[j], dateValues[i]);
      let distanceNorm = (Math.round(distance / minLapse) + 2) * eventsMinDistance;

      if (distanceNorm < eventsMinDistance) {
        distanceNorm = eventsMinDistance;
      } else if (distanceNorm > eventsMaxDistance) {
        distanceNorm = eventsMaxDistance;
      }
      left = left + distanceNorm;
      dateElements[i].setAttribute('style', 'left:' + left + 'px');
    }

    line.current.style.width = (left + eventsMinDistance) + 'px';
    setLineLength(left + eventsMinDistance);
    selectNewDate(dateElements[selectedDateIndex]);
    resetTimelinePosition('next');
  };

  const initEvents = (dateElements, selectedDate) => {
    datesContainer.current.addEventListener('click', (event) => {
      event.preventDefault();
      if (event.target.classList.contains('cd-h-timeline__date')) {
        selectNewDate(event.target);
      }
    });
  };

  const selectNewDate = (target) => {
    const dateElements = datesContainer.current.getElementsByClassName('cd-h-timeline__date');
    const selectedDateIndex = Array.prototype.indexOf.call(dateElements, target);

    setSelectedDateIndex(selectedDateIndex);
    updateOlderEvents(selectedDateIndex);
    updateVisibleContent(selectedDateIndex);
    updateFilling(selectedDateIndex);
  };

  const updateOlderEvents = (selectedDateIndex) => {
    const dateElements = datesContainer.current.getElementsByClassName('cd-h-timeline__date');

    for (let i = 0; i < dateElements.length; i++) {
      if (i < selectedDateIndex) {
        dateElements[i].classList.add('cd-h-timeline__date--older-event');
      } else {
        dateElements[i].classList.remove('cd-h-timeline__date--older-event');
      }
    }
  };

  const updateVisibleContent = (selectedDateIndex) => {
    const contentElements = datesContainer.current.getElementsByClassName('cd-h-timeline__event');

    for (let i = 0; i < contentElements.length; i++) {
      if (i === selectedDateIndex) {
        contentElements[i].classList.add('cd-h-timeline__event--selected');
      } else {
        contentElements[i].classList.remove('cd-h-timeline__event--selected');
      }
    }
  };

  const updateFilling = (selectedDateIndex) => {
    const dateElements = datesContainer.current.getElementsByClassName('cd-h-timeline__date');
    const selectedDateStyle = window.getComputedStyle(dateElements[selectedDateIndex], null);
    const left = parseFloat(selectedDateStyle.getPropertyValue("left"));
    const width = parseFloat(selectedDateStyle.getPropertyValue("width"));
    const leftValue = left + width / 2;
    fillingLine.current.style.transform = `scaleX(${leftValue / lineLength})`;
  };

  const translateTimeline = (direction) => {
    const containerWidth = datesContainer.current.offsetWidth;
    let newTranslate = translate;

    if (direction === 'next') {
      newTranslate -= containerWidth - eventsMinDistance;
    } else {
      newTranslate += containerWidth - eventsMinDistance;
    }

    if (0 - newTranslate > lineLength - containerWidth) {
      newTranslate = containerWidth - lineLength;
    }
    if (newTranslate > 0) {
      newTranslate = 0;
    }

    setTranslate(newTranslate);
    line.current.style.transform = `translateX(${newTranslate}px)`;
    updateNavigation(newTranslate, containerWidth);
  };

  const updateNavigation = (newTranslate, containerWidth) => {
    const navigationItems = datesContainer.current.getElementsByClassName('cd-h-timeline__navigation-item');

    if (newTranslate === 0) {
      navigationItems[0].classList.add('cd-h-timeline__navigation--inactive');
    } else {
      navigationItems[0].classList.remove('cd-h-timeline__navigation--inactive');
    }

    if (newTranslate === containerWidth - lineLength) {
      navigationItems[1].classList.add('cd-h-timeline__navigation--inactive');
    } else {
      navigationItems[1].classList.remove('cd-h-timeline__navigation--inactive');
    }
  };

  const resetTimelinePosition = () => {
    const eventStyle = window.getComputedStyle(datesContainer.current.getElementsByClassName('cd-h-timeline__date--selected')[0], null);
    const eventLeft = parseFloat(eventStyle.getPropertyValue('left'));
    const timelineWidth = datesContainer.current.offsetWidth;

    if ((translate < 0 && eventLeft >= timelineWidth - translate) || (translate > 0 && eventLeft <= -translate)) {
      const newTranslate = timelineWidth / 2 - eventLeft;
      setTranslate(newTranslate);
      line.current.style.transform = `translateX(${newTranslate}px)`;
    }
  };

  return (
    <section class="cd-h-timeline js-cd-h-timeline margin-bottom-md">
    <p class="text-center margin-top-md margin-bottom-xl">👈 <a class="text--inherit" href="https://codyhouse.co/gem/horizontal-timeline/">Article &amp; Download</a></p>

    <div class="cd-h-timeline__container container">
      <div class="cd-h-timeline__dates" ref={datesContainer}>
        <div class="cd-h-timeline__line" ref={line}
        >
          <ol>
            <li><a href="#0" data-date="16/01/2014" class="cd-h-timeline__date cd-h-timeline__date--selected">16 Jan</a></li>
            <li><a href="#0" data-date="28/02/2014" class="cd-h-timeline__date">28 Feb</a></li>
            <li><a href="#0" data-date="20/04/2014" class="cd-h-timeline__date">20 Mar</a></li>
            <li><a href="#0" data-date="20/05/2014" class="cd-h-timeline__date">20 May</a></li>
            <li><a href="#0" data-date="09/07/2014" class="cd-h-timeline__date">09 Jul</a></li>
            <li><a href="#0" data-date="30/08/2014" class="cd-h-timeline__date">30 Aug</a></li>
            <li><a href="#0" data-date="15/09/2014" class="cd-h-timeline__date">15 Sep</a></li>
            <li><a href="#0" data-date="01/11/2014" class="cd-h-timeline__date">01 Nov</a></li>
            <li><a href="#0" data-date="10/12/2014" class="cd-h-timeline__date">10 Dec</a></li>
            <li><a href="#0" data-date="19/01/2015" class="cd-h-timeline__date">29 Jan</a></li>
            <li><a href="#0" data-date="03/03/2015" class="cd-h-timeline__date">3 Mar</a></li>
          </ol>

          <span class="cd-h-timeline__filling-line" ref={fillingLine} aria-hidden="true"></span>
        </div> 
      </div> 
        
      <ul>
        <li><a href="#0" class="text-replace cd-h-timeline__navigation cd-h-timeline__navigation--prev cd-h-timeline__navigation--inactive">Prev</a></li>
        <li><a href="#0" class="text-replace cd-h-timeline__navigation cd-h-timeline__navigation--next">Next</a></li>
      </ul>
    </div>

    <div class="cd-h-timeline__events">
      <ol>
        <li class="cd-h-timeline__event cd-h-timeline__event--selected text-component">
          <div class="cd-h-timeline__event-content container">
            <h2 class="cd-h-timeline__event-title">Horizontal Timeline</h2>
            <em class="cd-h-timeline__event-date">January 16th, 2014</em>
            <p class="cd-h-timeline__event-description color-contrast-medium"> 
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus dolores porro doloribus.
            </p>
          </div>
        </li>

        <li class="cd-h-timeline__event text-component">
          <div class="cd-h-timeline__event-content container">
            <h2 class="cd-h-timeline__event-title">Event title here</h2>
            <em class="cd-h-timeline__event-date">February 28th, 2014</em>
            <p class="cd-h-timeline__event-description color-contrast-medium"> 
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus dolores porro doloribus.
            </p>
          </div>
        </li>

        <li class="cd-h-timeline__event text-component">
          <div class="cd-h-timeline__event-content container">
            <h2 class="cd-h-timeline__event-title">Event title here</h2>
            <em class="cd-h-timeline__event-date">March 20th, 2014</em>
            <p class="cd-h-timeline__event-description color-contrast-medium"> 
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus dolores porro doloribus.
            </p>
          </div>
        </li>

        <li class="cd-h-timeline__event text-component">
          <div class="cd-h-timeline__event-content container">
            <h2 class="cd-h-timeline__event-title">Event title here</h2>
            <em class="cd-h-timeline__event-date">May 20th, 2014</em>
            <p class="cd-h-timeline__event-description color-contrast-medium"> 
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus dolores porro doloribus.
            </p>
          </div>
        </li>

        <li class="cd-h-timeline__event text-component">
          <div class="cd-h-timeline__event-content container">
            <h2 class="cd-h-timeline__event-title">Event title here</h2>
            <em class="cd-h-timeline__event-date">July 9th, 2014</em>
            <p class="cd-h-timeline__event-description color-contrast-medium"> 
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus dolores porro doloribus.
            </p>
          </div>
        </li>

        <li class="cd-h-timeline__event text-component">
          <div class="cd-h-timeline__event-content container">
            <h2 class="cd-h-timeline__event-title">Event title here</h2>
            <em class="cd-h-timeline__event-date">August 30th, 2014</em>
            <p class="cd-h-timeline__event-description color-contrast-medium"> 
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus dolores porro doloribus.
            </p>
          </div>
        </li>

        <li class="cd-h-timeline__event text-component">
          <div class="cd-h-timeline__event-content container">
            <h2 class="cd-h-timeline__event-title">Event title here</h2>
            <em class="cd-h-timeline__event-date">September 15th, 2014</em>
            <p class="cd-h-timeline__event-description color-contrast-medium"> 
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus dolores porro doloribus.
            </p>
          </div>
        </li>

        <li class="cd-h-timeline__event text-component">
          <div class="cd-h-timeline__event-content container">
            <h2 class="cd-h-timeline__event-title">Event title here</h2>
            <em class="cd-h-timeline__event-date">November 1st, 2014</em>
            <p class="cd-h-timeline__event-description color-contrast-medium"> 
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus dolores porro doloribus.
            </p>
          </div>
        </li>

        <li class="cd-h-timeline__event text-component">
          <div class="cd-h-timeline__event-content container">
            <h2 class="cd-h-timeline__event-title">Event title here</h2>
            <em class="cd-h-timeline__event-date">December 10th, 2014</em>
            <p class="cd-h-timeline__event-description color-contrast-medium"> 
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus dolores porro doloribus.
            </p>
          </div>
        </li>

        <li class="cd-h-timeline__event text-component">
          <div class="cd-h-timeline__event-content container">
            <h2 class="cd-h-timeline__event-title">Event title here</h2>
            <em class="cd-h-timeline__event-date">January 29th, 2015</em>
            <p class="cd-h-timeline__event-description color-contrast-medium"> 
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus dolores porro doloribus.
            </p>
          </div>
        </li>

        <li class="cd-h-timeline__event text-component">
          <div class="cd-h-timeline__event-content container">
            <h2 class="cd-h-timeline__event-title">Event title here</h2>
            <em class="cd-h-timeline__event-date">March 3rd, 2015</em>
            <p class="cd-h-timeline__event-description color-contrast-medium"> 
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus dolores porro doloribus.
            </p>
          </div>
        </li>
      </ol>
    </div> 
  </section>
  );
};

export default TimelineComponent;
