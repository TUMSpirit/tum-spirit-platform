
import {Button, Carousel, Col, Image, Modal, Row, Steps} from "antd";

import './UploadImportPopup.css'
import React, {useRef, useState} from "react";
import AddEventPopup from "./AddEventPopup";
import {lighten } from 'polished'
import {momentLocalizer} from "react-big-calendar";
import './TutorialPopup.css'

const image1 = require('../img/T_left.png')
const image2 = require('../img/T_right.png')

const TutorialPopup = ({isFirstLogin, setISFirstLogin}) => {

        const [currentSlide, setCurrentSlide] = useState(0);
        const carouselRef = useRef();
        const totalSlides = 4

        const next = () => {
            if (currentSlide >= totalSlides - 1) {
                // Close the modal if it's the last slide
                setISFirstLogin(false);
            } else {
                // Go to the next slide
                carouselRef.current.next();
            }
        };
    return (
        <div>
       <Modal width={'40%'} closable={false} open={isFirstLogin} footer={null}>
           <Row>
               <Col span={10}>
                   <Image preview={false} src={image1} />
               </Col>

               <Col span={14}>
           <Carousel  afterChange={(slide) => setCurrentSlide(slide)} ref={carouselRef} infinite={false}>
               <div style={{ position: 'relative', display: 'inline-block' }}>
                   <Image preview={false} src={image2} />
               </div>
               <div style={{ position: 'relative', display: 'inline-block' }}>
                   <Image preview={false} src={image2} />
               </div>
               <div style={{ position: 'relative', display: 'inline-block' }}>
                   <Image preview={false} src={image2} />
               </div>
               <div style={{ position: 'relative', display: 'inline-block' }}>
                   <Image preview={false} src={image2} />
               </div>
           </Carousel>
           <Button style={{ position: 'absolute', top: '92%', left: 20, transform: 'translateY(-50%)' }} onClick={() => setISFirstLogin(false)}>Skip</Button>
           <Button type={"primary"} style={{ position: 'absolute', top: '92%', right: 20, transform: 'translateY(-50%)' }} onClick={next}>{currentSlide >= totalSlides - 1 ? 'Finish' : 'Next'}</Button>
               </Col>
               </Row>
           </Modal>


        </div>
    );

};

export default TutorialPopup