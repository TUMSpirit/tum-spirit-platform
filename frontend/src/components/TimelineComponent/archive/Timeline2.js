// Timeline.js
import React from "react";
import { Chrono } from "react-chrono";
import data from "./data";

import './style.css';

const Timeline = () => {

    return (
        <section className="cd-horizontal-timeline">
            <div className="timeline">
                <div className="events-wrapper">
                    <div className="events">
                        <ol>
                            <li><a href="#0" data-date="01/01/2017" className="selected">Jan 2017</a></li>
                            <li><a href="#0" data-date="01/09/2017">Sep 2017</a></li>
                            <li><a href="#0" data-date="01/12/2017">Dec 2017</a></li>
                            <li><a href="#0" data-date="01/03/2018">Mar 2018</a></li>
                            <li><a href="#0" data-date="09/05/2018">June 2018</a></li>
                            <li><a href="#0" data-date="01/01/2019">Jan 2019</a></li>
                        </ol>

                        <span className="filling-line" aria-hidden="true"></span>
                    </div>
                    <!-- .events -->
                </div>
                <!-- .events-wrapper -->

                <ul className="cd-timeline-navigation">
                    <li><a href="#0" className="prev inactive">Prev</a></li>
                    <li><a href="#0" className="next">Next</a></li>
                </ul>
                <!-- .cd-timeline-navigation -->
            </div>
            <!-- .timeline -->

            <div className="events-content">
                <ol>
                    <li className="selected" data-date="16/01/2014">
                        <h2>An Introduction to Infosec</h2>
                        <em>January, 2017</em>
                        <p>
                            Back in January, 2017 I began my journey of studies into different areas of infosec to see
                            if it was a challenge I would enjoy and a future prospect for further learning through
                            college.
                        </p>
                    </li>

                    <li data-date="01/09/2017">
                        <h2>Fanshawe College Cyber Security</h2>
                        <em>September, 2017</em>
                        <p>
                            In September, 2018 I enrolled into the Cyber Security course at Fanshawe College.
                        </p><br>
                        <p>Key courses include: </p>
                    </li>

                    <li data-date="01/12/2017">
                        <h2>CTF</h2>
                        <em>December, 2017</em>
                        <p>
                            Participated in CTF.
                        </p>
                    </li>

                    <li data-date="01/03/2018">
                        <h2>Event title here</h2>
                        <em>May 20th, 2014</em>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit
                            recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic
                            repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis
                            eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus
                            dolores porro doloribus.
                        </p>
                    </li>

                    <li data-date="09/07/2014">
                        <h2>Event title here</h2>
                        <em>July 9th, 2014</em>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit
                            recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic
                            repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis
                            eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus
                            dolores porro doloribus.
                        </p>
                    </li>

                    <li data-date="30/08/2014">
                        <h2>Event title here</h2>
                        <em>August 30th, 2014</em>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit
                            recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic
                            repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis
                            eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus
                            dolores porro doloribus.
                        </p>
                    </li>

                    <li data-date="15/09/2014">
                        <h2>Event title here</h2>
                        <em>September 15th, 2014</em>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit
                            recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic
                            repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis
                            eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus
                            dolores porro doloribus.
                        </p>
                    </li>

                    <li data-date="01/11/2014">
                        <h2>Event title here</h2>
                        <em>November 1st, 2014</em>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit
                            recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic
                            repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis
                            eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus
                            dolores porro doloribus.
                        </p>
                    </li>

                    <li data-date="10/12/2014">
                        <h2>Event title here</h2>
                        <em>December 10th, 2014</em>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit
                            recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic
                            repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis
                            eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus
                            dolores porro doloribus.
                        </p>
                    </li>

                    <li data-date="19/01/2015">
                        <h2>Event title here</h2>
                        <em>January 19th, 2015</em>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit
                            recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic
                            repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis
                            eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus
                            dolores porro doloribus.
                        </p>
                    </li>

                    <li data-date="03/03/2015">
                        <h2>Event title here</h2>
                        <em>March 3rd, 2015</em>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum praesentium officia, fugit
                            recusandae ipsa, quia velit nulla adipisci? Consequuntur aspernatur at, eaque hic
                            repellendus sit dicta consequatur quae, ut harum ipsam molestias maxime non nisi reiciendis
                            eligendi! Doloremque quia pariatur harum ea amet quibusdam quisquam, quae, temporibus
                            dolores porro doloribus.
                        </p>
                    </li>
                </ol>
            </div>
            <!-- .events-content -->
        </section>
);
};

export default Timeline;
