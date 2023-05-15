import React, { useState , useImperativeHandle,forwardRef} from 'react';
import { Container } from './Timeline.styled';
import {  Steps, Popconfirm} from 'antd';
import PropTypes from 'prop-types';
var steps = ['finish','process','wait','wait','wait','wait','wait'];

const Timeline = ({onChange},stepsRef) => {
    const [stepNow,setStepNow] = useState(0)

    useImperativeHandle(stepsRef, () => ({
        updateStep: () => {
            steps[stepNow] = 'process';
            steps[stepNow-1]='finish';
        }
    }))

    return(
        <Container>
            <Steps size="small">
                    {steps.map((state,index) => (
                            <Steps.Item status={state} key={index} onClick={() => {
                                if(steps[index-1] === 'process'){
                                    onChange(true);
                                    setStepNow(index);
                                }
                            }
                            }>
                            </Steps.Item>                      
                    ))}
            </Steps>
        </Container>
    );
};


Timeline.propTypes = {
	onChange: PropTypes.func,
};

export default forwardRef(Timeline);
