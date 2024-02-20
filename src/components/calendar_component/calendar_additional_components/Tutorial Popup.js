
import {Button, Carousel, Image, Modal, Steps} from "antd";

import './UploadImportPopup.css'
import React, {useRef, useState} from "react";
import AddEventPopup from "./AddEventPopup";
import {lighten } from 'polished'
import {momentLocalizer} from "react-big-calendar";
const image1 = require('../img/t.PNG')

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
       <Modal closable={false} open={isFirstLogin} footer={null}>
           <Carousel afterChange={(slide) => setCurrentSlide(slide)} ref={carouselRef} infinite={false}>
               <div style={{ position: 'relative', display: 'inline-block' }}>
                   <Image preview={false} src={image1} />
               </div>
               <div style={{ position: 'relative', display: 'inline-block' }}>
                   <Image preview={false} src={image1} />
               </div>
               <div style={{ position: 'relative', display: 'inline-block' }}>
                   <Image preview={false} src={image1} />
               </div>
               <div style={{ position: 'relative', display: 'inline-block' }}>
                   <Image preview={false} src={image1} />
               </div>
           </Carousel>
           <Button style={{ position: 'absolute', top: '80%', left: 40, transform: 'translateY(-50%)' }} onClick={() => setISFirstLogin(false)}>Skip</Button>
           <Button type={"primary"} style={{ position: 'absolute', top: '80%', right: 40, transform: 'translateY(-50%)' }} onClick={next}>{currentSlide >= totalSlides - 1 ? 'Finish' : 'Next'}</Button>
       </Modal>


        </div>
    );

};

export default TutorialPopup