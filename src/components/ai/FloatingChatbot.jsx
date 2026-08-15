import React from "react";
//import "./FloatingChatbot.css";

export function FloatingChatbot() {
	return (
		<button
			type="button"
			className="ai-chatbot-btn"
			aria-label="AI 챗봇 열기"
			onClick={() => {
				console.log("챗봇 열기");
			}}
		>
			<span className="ai-chatbot-btn__icon" aria-hidden="true"></span>
            <strong>AI 상담</strong>
		</button>
	);
}

export default FloatingChatbot;