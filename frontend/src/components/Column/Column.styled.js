import styled from 'styled-components';
import { createGlobalStyle } from 'styled-components'

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  margin: 8px 4px;
  
  &:first-child {
    margin-left: 0
  }
`;

export const Container = styled.div`
  min-width: 280px;
  max-width: 280px;
  border: 0px solid #E4E7EF;
  padding: 4px;
  align-self: flex-start;
  margin-right:40px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 4px;
  
  span {
    font-size: 20px;
    margin-left: 4px;
  }
`;

export const ColumnTitle = styled.h4`
  font-weight: 100;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  position:relative;
  top:5px;
`;


export const HeaderActions = styled.div`
  display: flex;
  align-items: center;

`;

export const GlobalStyle = createGlobalStyle`
  body {
    .ant-popconfirm-buttons :where(.css-dev-only-do-not-override-1wazalj).ant-btn.ant-btn-sm{
      height:40px;
      width:50px;
    }
  }
`;

export const IssueCount = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  width: auto;
  height: 16px;
  border: 0px solid #8D9093;
  color: black;
  font-weight: 400;
  padding: 0 4px;
`;
