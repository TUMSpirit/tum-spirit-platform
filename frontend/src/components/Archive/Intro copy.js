
<div id="wrapper">
	<div id="content">
		<div class="ghost">
			<div class="ghost__eyes"></div>

			<div class="ghost__feet">
				<div class="ghost__feet__foot"></div>
				<div class="ghost__feet__foot"></div>
				<div class="ghost__feet__foot"></div>
				<div class="ghost__feet__foot"></div>
			</div>
		</div>
		<div id="shadow"></div>
	</div>
</div>




/*
$bg: hsl(225, 68%, 38%);
$ghost-bg: hsl(0, 0%, 100%);
$ghost-glow: hsl(240, 42%, 79%, 0.8);
$ghost-holes: hsl(0, 0%, 5%);
$shadow: hsla(0, 0%, 0%, 0.8);
$shadow-lighter: hsla(0, 0%, 0%, 0.7);

*,
*::after,
*::before {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
}

#wrapper {
	background: $bg;
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
}

.ghost {
	position: relative;
	width: 150px;
	height: 200px;
	background: $ghost-bg;
	box-shadow: 0px 0px 60px $ghost-glow;
	border-radius: 100px 100px 0 0;
	z-index: 100;
	animation: 2.5s infinite float;
	&__eyes {
		display: flex;
		justify-content: space-around;
		margin: 0 auto;
		padding: 70px 0 0;
		width: 90px;
		height: 20px;
		&::before,
		&::after {
			content: "";
			display: block;
			width: 15px;
			height: 25px;
			background: $ghost-holes;
			border-radius: 50%;
		}
	}
	&__mouth {
		display: flex;
		justify-content: center;
		margin: 0 auto;
		padding: 35px 0 0;
		width: 90px;
		height: 20px;
		&::after {
			content: "";
			display: block;
			width: 15px;
			height: 25px;
			background: $ghost-holes;
			border-radius: 50%;
		}
	}
	&__feet {
		width: 100%;
		position: absolute;
		bottom: -13px;
		display: flex;
		justify-content: space-between;
		&__foot {
			width: 25%;
			height: 26px;
			border-radius: 50%;
			background: $ghost-bg;
		}
	}
}

@keyframes float {
	0%,
	100% {
		transform: translateY(0);
	}

	50% {
		transform: translateY(-20px);
	}
}

#shadow {
	width: 150px;
	height: 40px;
	margin-top: 50px;
	border-radius: 50%;
	animation: 2.5s infinite shadow;
}

@keyframes shadow {
	0%,
	100% {
		background: $shadow;
		transform: scale(1);
	}

	50% {
		background: $shadow-lighter;
		transform: scale(0.8);
	}
}

*/