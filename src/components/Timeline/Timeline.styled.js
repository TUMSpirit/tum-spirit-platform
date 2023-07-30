import styled from 'styled-components';

export const Container = styled.div`
    padding:10px;
    background-color:white;
    width:calc(100% - 270px);
    overflow-x: scroll;
    overflow-y: hidden;
    position:fixed;
    bottom:0px;
    margin-left:-20px;
    height:10vh;
    ::-webkit-scrollbar {
        display: none; /* Chrome Safari */
      }
`;

export const ContainerMobile = styled.div`
    padding:10px;
    background-color:white;
    width:100%;
    overflow-x: scroll;
    overflow-y: hidden;
    position:fixed;
    bottom:0px;
    margin-left:-20px;
    height:10vh;
`;


