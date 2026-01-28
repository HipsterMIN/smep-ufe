const AiChatButton = ({ btnName, isBtnClick }) => {
  return (
    <button className={`aichatButton ${isBtnClick && 'active'}`}>
      { btnName }
    </button>
  );
};

export default AiChatButton;
