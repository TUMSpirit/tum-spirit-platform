import React, { useState , useImperativeHandle,forwardRef} from 'react';
import { Container,ContainerMobile } from './Timeline.styled';
import {  Steps, Popconfirm, Card} from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment/moment';
import { useMediaQuery } from 'react-responsive';
import { CheckCircleOutlined,ClockCircleOutlined,ConsoleSqlOutlined,ScheduleOutlined} from '@ant-design/icons';
var steps = ['finish','process','wait','wait','wait','wait','wait'];

const Timeline = ({onChange,changeColumn,data},stepsRef) => {
    const [stepNow,setStepNow] = useState(0)

    useImperativeHandle(stepsRef, () => ({
        updateStep: () => {
            steps[stepNow] = 'process';
            steps[stepNow-1]='finish';
        }
    }))

    // console.log(data[0].start_time)
    // const diff = moment(data[0].end_time).diff(moment(data[0].start_time),'day')
    const diff = []
    const diff_mobile = []
    const start_point = []
    const start_point_mobile = []
    const base = moment('2024-03-01').diff(moment('2023-09-01'),'day')
    for( const des of data){
        diff.push((moment(des.end_time).diff(moment(des.start_time),'day')/base)*87.5+'vw')
        start_point.push((moment(des.start_time).diff(moment('2023-09-01'),'day')/base)*87.5+'vw')
    }
    for( const des of data){
        diff_mobile.push((moment(des.end_time).diff(moment(des.start_time),'day')/base)*1410)
        start_point_mobile.push((moment(des.start_time).diff(moment('2023-09-01'),'day')/base)*1410)
    }

    const isMobile = useMediaQuery({ query: '(max-device-width: 600px)' })
    return(
        <div>
        {isMobile
            ?
            <ContainerMobile>
            {
            isMobile
            ?
            // the completed period of project
            <div style={{ justifyContent: 'flex-start',display:'flex'}}>
                <p style={{marginBottom:0}}>SEP</p>
                <p style={{marginBottom:0,paddingLeft:200}}>OCT</p>
                <p style={{marginBottom:0,paddingLeft:200}}>NOV</p>
                <p style={{marginBottom:0,paddingLeft:200}}>DEC</p>
                <p style={{marginBottom:0,paddingLeft:200}}>JAN</p>
                <p style={{marginBottom:0,paddingLeft:200}}>FEB</p>
                <p style={{marginBottom:0,paddingLeft:200}}>MAR</p>
            </div>
            :
            <div style={{ justifyContent: 'space-between',display:'flex'}}>
                <p style={{marginBottom:0}}>SEP</p>
                <p style={{marginBottom:0}}>OCT</p>
                <p style={{marginBottom:0}}>NOV</p>
                <p style={{marginBottom:0}}>DEC</p>
                <p style={{marginBottom:0}}>JAN</p>
                <p style={{marginBottom:0}}>FEB</p>
                <p style={{marginBottom:0}}>MAR</p>
            </div>
            }
            <div style={{ justifyContent: 'flex-start',display:'flex',margin:0,padding:0}}>
                {
                    isMobile
                    ?
                    // Card of Meilstone
                    <>
                        <Card style={{ width: diff_mobile[3],height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point_mobile[3] }} onClick={()=>{onChange(3);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[3].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Final Evaluation</span>
                        </p>
                    </Card>
                    <Card style={{ width:diff_mobile[2] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point_mobile[2] }} onClick={()=>{onChange(2);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[2].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Draw HIFI Prototype</span>
                        </p>
                    </Card>
                    <Card style={{ width: diff_mobile[1] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point_mobile[1] }} onClick={()=>{onChange(1);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[1].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Draw LOFI Prototype</span>
                        </p>
                    </Card>
                    <Card style={{ width: diff_mobile[0] ,height:50,display:'flex',alignItems:'center',position:'absolute',left: start_point_mobile[0]}} onClick={()=>{onChange(0);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[0].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Interview With User Group</span>
                        </p>
                    </Card>
                    </>
                    :
                    <>
                        <Card style={{ width: diff[3] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point[3] }} onClick={()=>{onChange(3);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[3].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Final Evaluation</span>
                        </p>
                    </Card>
                    <Card style={{ width: diff[2] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point[2] }} onClick={()=>{onChange(2);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[2].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Draw HIFI Prototype</span>
                        </p>
                    </Card>
                    <Card style={{ width: diff[1] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point[1] }} onClick={()=>{onChange(1);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[1].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Draw LOFI Prototype</span>
                        </p>
                    </Card>
                    <Card style={{ width: diff[0] ,height:50,display:'flex',alignItems:'center',position:'absolute',left: start_point[0]}} onClick={()=>{onChange(0);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[0].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Interview With User Group</span>
                        </p>
                    </Card>
                    </>
                }
                {/* <Card style={{ width: diff[3] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point[3] }} onClick={()=>{onChange(3);changeColumn()}}>
                    <p style={{margin:0}}>
                        {(() => {
                            switch (data[3].status) {
                                case 1:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                case 2:
                                    return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                case 3:
                                    return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                default:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                            }
                        })()}
                        <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Final Evaluation</span>
                    </p>
                </Card>
                <Card style={{ width: diff[2] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point[2] }} onClick={()=>{onChange(2);changeColumn()}}>
                    <p style={{margin:0}}>
                        {(() => {
                            switch (data[2].status) {
                                case 1:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                case 2:
                                    return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                case 3:
                                    return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                default:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                            }
                        })()}
                        <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Draw HIFI Prototype</span>
                    </p>
                </Card>
                <Card style={{ width: diff[1] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point[1] }} onClick={()=>{onChange(1);changeColumn()}}>
                    <p style={{margin:0}}>
                        {(() => {
                            switch (data[1].status) {
                                case 1:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                case 2:
                                    return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                case 3:
                                    return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                default:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                            }
                        })()}
                        <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Draw LOFI Prototype</span>
                    </p>
                </Card>
                <Card style={{ width: diff[0] ,height:50,display:'flex',alignItems:'center',position:'absolute',left: start_point[0]}} onClick={()=>{onChange(0);changeColumn()}}>
                    <p style={{margin:0}}>
                        {(() => {
                            switch (data[0].status) {
                                case 1:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                case 2:
                                    return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                case 3:
                                    return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                default:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                            }
                        })()}
                        <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Interview With User Group</span>
                    </p>
                </Card> */}

            </div>

        </ContainerMobile>
            :
            <Container>
            {
            isMobile
            ?
            <div style={{ justifyContent: 'flex-start',display:'flex'}}>
                <p style={{marginBottom:0}}>SEP</p>
                <p style={{marginBottom:0,paddingLeft:200}}>OCT</p>
                <p style={{marginBottom:0,paddingLeft:200}}>NOV</p>
                <p style={{marginBottom:0,paddingLeft:200}}>DEC</p>
                <p style={{marginBottom:0,paddingLeft:200}}>JAN</p>
                <p style={{marginBottom:0,paddingLeft:200}}>FEB</p>
                <p style={{marginBottom:0,paddingLeft:200}}>MAR</p>
            </div>
            :
            <div style={{ justifyContent: 'space-between',display:'flex'}}>
                <p style={{marginBottom:0}}>SEP</p>
                <p style={{marginBottom:0}}>OCT</p>
                <p style={{marginBottom:0}}>NOV</p>
                <p style={{marginBottom:0}}>DEC</p>
                <p style={{marginBottom:0}}>JAN</p>
                <p style={{marginBottom:0}}>FEB</p>
                <p style={{marginBottom:0}}>MAR</p>
            </div>
            }
            <div style={{ justifyContent: 'flex-start',display:'flex',margin:0,padding:0}}>
                {
                    isMobile
                    ?
                    <>
                        <Card style={{ width: diff_mobile[3],height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point_mobile[3] }} onClick={()=>{onChange(3);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[3].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Final Evaluation</span>
                        </p>
                    </Card>
                    <Card style={{ width:diff_mobile[2] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point_mobile[2] }} onClick={()=>{onChange(2);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[2].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Draw HIFI Prototype</span>
                        </p>
                    </Card>
                    <Card style={{ width: diff_mobile[1] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point_mobile[1] }} onClick={()=>{onChange(1);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[1].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Draw LOFI Prototype</span>
                        </p>
                    </Card>
                    <Card style={{ width: diff_mobile[0] ,height:50,display:'flex',alignItems:'center',position:'absolute',left: start_point_mobile[0]}} onClick={()=>{onChange(0);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[0].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Interview With User Group</span>
                        </p>
                    </Card>
                    </>
                    :
                    <>
                        <Card style={{ width: diff[3] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point[3] }} onClick={()=>{onChange(3);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[3].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Final Evaluation</span>
                        </p>
                    </Card>
                    <Card style={{ width: diff[2] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point[2] }} onClick={()=>{onChange(2);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[2].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Draw HIFI Prototype</span>
                        </p>
                    </Card>
                    <Card style={{ width: diff[1] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point[1] }} onClick={()=>{onChange(1);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[1].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Draw LOFI Prototype</span>
                        </p>
                    </Card>
                    <Card style={{ width: diff[0] ,height:50,display:'flex',alignItems:'center',position:'absolute',left: start_point[0]}} onClick={()=>{onChange(0);changeColumn()}}>
                        <p style={{margin:0}}>
                            {(() => {
                                switch (data[0].status) {
                                    case 1:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                    case 2:
                                        return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                    case 3:
                                        return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                    default:
                                        return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                }
                            })()}
                            <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Interview With User Group</span>
                        </p>
                    </Card>
                    </>
                }
                {/* <Card style={{ width: diff[3] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point[3] }} onClick={()=>{onChange(3);changeColumn()}}>
                    <p style={{margin:0}}>
                        {(() => {
                            switch (data[3].status) {
                                case 1:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                case 2:
                                    return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                case 3:
                                    return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                default:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                            }
                        })()}
                        <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Final Evaluation</span>
                    </p>
                </Card>
                <Card style={{ width: diff[2] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point[2] }} onClick={()=>{onChange(2);changeColumn()}}>
                    <p style={{margin:0}}>
                        {(() => {
                            switch (data[2].status) {
                                case 1:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                case 2:
                                    return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                case 3:
                                    return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                default:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                            }
                        })()}
                        <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Draw HIFI Prototype</span>
                    </p>
                </Card>
                <Card style={{ width: diff[1] ,height:50,display:'flex',alignItems:'center',position:'absolute',left:start_point[1] }} onClick={()=>{onChange(1);changeColumn()}}>
                    <p style={{margin:0}}>
                        {(() => {
                            switch (data[1].status) {
                                case 1:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                case 2:
                                    return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                case 3:
                                    return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                default:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                            }
                        })()}
                        <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Draw LOFI Prototype</span>
                    </p>
                </Card>
                <Card style={{ width: diff[0] ,height:50,display:'flex',alignItems:'center',position:'absolute',left: start_point[0]}} onClick={()=>{onChange(0);changeColumn()}}>
                    <p style={{margin:0}}>
                        {(() => {
                            switch (data[0].status) {
                                case 1:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                                case 2:
                                    return <ClockCircleOutlined style={{fontSize:'30px', color:'#2575CA',float:'left',textAlign:'center'}} />;
                                case 3:
                                    return <ScheduleOutlined style={{fontSize:'30px', color:'#9B9B9B',float:'left',textAlign:'center'}} />;
                                default:
                                    return <CheckCircleOutlined style={{fontSize:'30px', color:'#56B535',float:'left',textAlign:'center'}} />;
                            }
                        })()}
                        <span style={{fontSize:'16px',position:'absolute',marginLeft:40,float:'left',lineHeight:'30px'}}>Interview With User Group</span>
                    </p>
                </Card> */}

            </div>

        </Container>
        }
        </div>
    );
};


Timeline.propTypes = {
	onChange: PropTypes.func,
};

export default forwardRef(Timeline);
