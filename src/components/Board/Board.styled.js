import styled from 'styled-components';

export const Container = styled.div`
    overflow: scroll;
`;

export const Columns = styled.div`
  display: flex;
  height:20%;
`;

export const Timeliner = styled.div`
  position:absolute;
  top:15%;
  right:5%;
  height:500px;
`;

export const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  left: 0;
  top: 0;
  padding: 8px 0;
  width: 48px;
  height: 100%;
  z-index: 1;
`;
