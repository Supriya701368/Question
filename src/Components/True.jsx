
import './Questions.css'; // Import the CSS file

import { useEffect,useState } from 'react';

const True = ({
  Questions,
  handleParaQuestionPaste,
  handleSave,
  update,
  handleOptionPaste,
  addNewQuestion,
  handlePaste,
  handleAnswerChange,
  handleRemoveImage,
  removeQuestion,
  includeParagraph,
  includeSolution,
  addOptionE,
}) => {
 const [clickedBox, setClickedBox] = useState(null); // Track the clicked box

    const clearImages = () => {
        const updatedQuestions = [...Questions].map(question => {
            return {
                ...question,
                questionImage: null,
                paragraphImage: null,
                paraquestions: question.paraquestions.map(q => ({
                    ...q,
                    paraquestionImage: null,
                })),
                answer:"",
                solutionImage: null,
                options: question.options.map(option => ({
                    ...option,
                    image: null,
                })),
            };
        });
        update(updatedQuestions); // Update the state with cleared images
    };

    const handleSaveWithClear = (data) => {
        handleSave(data);  // Call the original save function
        clearImages();     // Clear images after saving
    };
    const handleBoxClick = (index, paraIndex) => {
        setClickedBox(`paraquestion-${index}-${paraIndex}`);
    };

    const handleClickBox = (boxName) => {
        setClickedBox(boxName); // Set clicked box to highlight it
    };

  return (
    <div className="mcq-container">
      <div className="question-wrapper">
        <h2>Paste Question and Options (MCQ)</h2>
        {Questions.length > 0 ? (
          Questions.map((question, index) => (
            <div key={index} className="question-item">
              <h3>Question {index + 1}</h3>

              {index > 0 && (
                <button
                  onClick={() => removeQuestion(index)}
                  className="remove-button"
                >
                  Remove Previous Question
                </button>
              )}

              {/* Question Image Section */}
              <div className="question-image-container">
                <h3>Paste Image for Question</h3>
                <div
                  className={`option box ${clickedBox === `question-${index}` ? 'clicked' : ''}`}
                  onClick={() => handleClickBox(`question-${index}`)} // Handle the click event
                  onPaste={(e) => {
                    const clipboardItems = e.clipboardData.items;
                    for (let i = 0; i < clipboardItems.length; i++) {
                      if (clipboardItems[i].type.startsWith("image/")) {
                        const file = clipboardItems[i].getAsFile();
                        const reader = new FileReader();
                        reader.onload = () => {
                          const updatedQuestions = [...Questions];
                          updatedQuestions[index].questionImage = reader.result;
                          update(updatedQuestions);
                        };
                        reader.readAsDataURL(file);
                        break;
                      }
                    }
                  }}                                >
                  {question.questionImage ? (
                    <>
                      <img

                        src={question.questionImage}
                        alt={`Question ${index + 1}`}
                      />
                      <button
                        onClick={() => handleRemoveImage(index, "question")}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    "Paste your question image here"
                  )}
                </div>
              </div>
              {includeParagraph && (
                <div className="paragraph-section">
                  <strong>Paragraph and Questions:</strong>
                  <div
                   className={`option-box ${clickedBox === `paragraph-${index}` ? 'clicked' : ''}`}
                   onClick={() => handleClickBox(`paragraph-${index}`)} // Handle the click event
                    onPaste={(e) => {
                      const clipboardItems = e.clipboardData.items;
                      for (let i = 0; i < clipboardItems.length; i++) {
                        if (clipboardItems[i].type.startsWith("image/")) {
                          const file = clipboardItems[i].getAsFile();
                          const reader = new FileReader();
                          reader.onload = () => {
                            const updatedQuestions = [...Questions];
                            updatedQuestions[index].paragraphImage = reader.result;
                            update(updatedQuestions);
                          };
                          reader.readAsDataURL(file);
                          break;
                        }
                      }
                    }}
                    
                  >
                    {/* Paragraph Image Section */}
                    {Questions[index].paragraphImage ? (
                      <>
                        <img
                          src={Questions[index].paragraphImage}
                          alt={`Paragraph Image`}
                          style={{ maxWidth: '100%' }}
                        />
                        <button
                          onClick={() => handleRemoveImage(index, "paragraph")}
                          className="remove-button"
                        >
                          Remove Paragraph Image
                        </button>
                      </>
                    ) : (
                      <div>Paste paragraph image here</div>
                    )}
                  </div>

                  {/* Question Images Section */}
                  {Questions[index].paraquestions.map((q, paraIndex) => (
                    <div key={paraIndex} className="question-section">
                      <strong>Question {paraIndex + 1}:</strong>
                      <div
                        onClick={() => handleBoxClick(index, paraIndex)} // Handle click on para-question box
                        className={`option-box ${clickedBox === `paraquestion-${index}-${paraIndex}` ? "clicked" : ""}`}
                        onPaste={(e) => { handleParaQuestionPaste(e, index, paraIndex) }}
                      >
                        {q.paraquestionImage ? (
                          <>
                            <img
                              src={q.paraquestionImage}
                              alt={`Question ${paraIndex + 1} Image`}
                              style={{ maxWidth: '100%' }}
                            />
                            <button
                              onClick={() => handleRemoveImage(index, "paragraph-question", paraIndex)}
                              className="remove-button"
                            >
                              Remove Question {paraIndex + 1} Image
                            </button>
                          </>
                        ) : (
                          <div>Paste question {paraIndex + 1} image here</div>
                        )}
                      </div>
                    </div>
                  ))}

                </div>
              )}

              {/* Options Section */}
              <div style={{ marginBottom: "20px" }}>
                <h3>Choose an Option</h3>
                <div>
                  <label>
                    <input
                      type="radio"
                      name={`option-${index}`}
                      value="True"
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                    />
                    True
                  </label>
                </div>
                <div>
                  <label>
                    <input
                      type="radio"
                      name={`option-${index}`}
                      value="False"
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                    />
                    False
                  </label>
                </div>
                <div>
                </div>
              </div>
              {addOptionE && question.options.length < 5 && (
                <div className="option-item">
                  <label>
                    <input
                      name="radio"
                      type="checkbox"
                      value={question.options[4]?.isCorrect}
                      onChange={(e) => handleAnswerChange(index, 4, e.target.checked)}
                      className="option-box"
                    />
                    Option E
                  </label>
                  <div
                    className="option-box"
                    onPaste={(e) => handleOptionPaste(e, index, 4)}
                  >
                    {question.options[4]?.image ? (
                      <>
                        <img src={question.options[4].image} alt="Option E" />
                        <button
                          onClick={() => handleRemoveImage(index, "option-4")}
                          className="remove-button"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      "Paste Option E image here"
                    )}
                  </div>
                </div>
              )}



              {/* Solution Image Section */}
              <div className="solution-image-container">
                <h3>Paste Image for Solution</h3>
                <div
                 className={`option-box ${clickedBox === `solution-${index}` ? 'clicked' : ''}`}
                 onClick={() => handleClickBox(`solution-${index}`)} // Handle the click event
                  onPaste={(e) => handlePaste(e, index)}
                >
                  {question.solutionImage ? (
                    <>
                      <img
                        src={question.solutionImage}
                        alt={`Solution ${index + 1}`}
                      />
                      <button
                        onClick={() => handleRemoveImage(index, "solution")}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    "Paste your solution image here"
                  )}
                </div>
              </div>
              <div>

              </div>
              {includeSolution && (
                <div className="solution-section">
                  <strong>Solution:</strong>
                  <div
                   className={`option-box ${clickedBox === `solution-${index}` ? 'clicked' : ''}`}
                   onClick={() => handleClickBox(`solution-${index}`)} // Handle the click event
                    onPaste={(e) => handlePaste(e, index)}

                  >
                    {question.solutionImage ? (
                      <>
                        <img
                          src={question.solutionImage}
                          alt={`Solution ${index + 1}`}
                        />
                        <button
                          onClick={() => handleRemoveImage(index, "solution")}
                          className="remove-button"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <div
                        className="paste-container"
                        onPaste={(e) => handlePaste(e, index, "solution")}
                      >
                        Paste solution image here
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Answer Section */}
              <div className="answer-container">
                <h3>Enter Answer</h3>
                <input
                  readOnly
                  type="text"
                  value={question.answer}  // Ensure answer is an array before calling join
                  className="answer-input"
                />
              </div>
            </div>
          ))
        ) : (
          <p>Loading questions...</p>
        )}

        <button
          onClick={addNewQuestion}
          className="add-button"
        >
          Add New Question
        </button>
        <button
                    onClick={(data) => handleSaveWithClear(data)}
                    className="save-button"
        >
          Save Document
        </button>
      </div>
    </div>
  );
};

export default True;
