import React, { useState } from 'react';
import { Button, Input, Space } from 'antd';
import { useHistory } from "react-router-dom";

	const LoginWalkthrough = () => {

	// Auflistung aller const

	// History-Deklaration zur Weiterleitung auf neue Seite
	const history = useHistory();
	const [errorCode, setErrorCode] = useState(0);

	function handleClick(pin) {
	console.log(pin);
		if (pin === "ABC-123"){
			history.push("/overview");
		}
		else {
			setErrorCode(1);
		}
	}

	return (
		<div>
			<h1>Bitte geben Sie einen Pin ein.</h1>
			<Input.Search placeholder="Pin" onSearch={handleClick} style={{ width: 200 }} />
			<br/>
			{errorCode == 1 && <div style={{ color: 'red'}}> Dieser Pin existiert nicht. Bitte versuche es erneut. </div> }

		</div>
	);
};

export default LoginWalkthrough;
