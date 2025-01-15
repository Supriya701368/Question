// src/components/MCQ.jsx
import { useState } from "react";
import "./Questions.css"
const True = (
  {
    Questions,
    handleSave,
    handleAnswerChange,
    update,
    handleOptionPaste,
    addNewQuestion,
    handlePaste,
    handleRemoveImage,
    removeQuestion,
    includeParagraph,
    includeSolution,
    addOptionE,
  }
) => {




  return (
    <div>
      <div className="mcq-container">
        <h2>Paste Question and Options(TRUE)</h2>
        {Questions.length > 0 ? Questions.map((question, index) => (
          <div key={index} style={{ marginBottom: "30px" }}>
            <h3>Question {index + 21}</h3>


            {index > 0 && (
              <button
                onClick={() => removeQuestion(index)}
                className="remove-button"
              >
                Remove Previous Question
              </button>
            )}
            <div style={{ marginBottom: "20px" }}>
              <h3 >Paste Image for Question</h3>
              <div
                 className="option-box"
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
              }}                >
                {question.questionImage ? (
                  <>
                    <img
                      src={question.questionImage}
                      alt={`Question ${index + 1}`}


                    />
                    <div><button
                      onClick={() => handleRemoveImage(index, "question")}
                      className="remove-button"
                    >
                      Remove
                    </button></div>
                  </>
                ) : (
                  "Paste your question image here"
                )}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h3>Choose an Option</h3>
              <div>
                <label>
                  <input
                    type="radio"
                    name={`option-${index}`}
                    value="true"
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
                    value="false"
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                  />
                  False
                </label>
              </div>
              <div>
              {includeParagraph && (
                                <div className="paragraph-section">
                                    <strong>Paragraph and Questions:</strong>
                                    <div
                                        className="option-box"
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
                                                className="option-box"
                                                onPaste={(e) => handlePaste(e, index)} // Passing paraIndex as questionIndex
                                                style={{ minHeight: '100px', border: '1px solid #ccc', padding: '10px' }}
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
              </div>
              <div>
              {includeSolution && (
                                <div className="solution-section">
                                    <strong>Solution:</strong>
                                    <div 
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

              </div>
              <div>
              {addOptionE && (
                                <div className="option-item">
                                    <label>
                                        <input
                                            name="radio"
                                            type="radio"
                                            value={question.optionE?.isCorrect}
                                            onChange={(e) => handleAnswerChange(index, 4, e.target.value)}
                                            className="option-box"
                                        />
                                        Option E
                                    </label>
                                    <div
                                        className="option-box"
                                        onPaste={(e) => handleOptionPaste(e, index, optionIndex)}
                                        >
                                        {question.optionE?.image ? (
                                            <>
                                                <img src={question.optionE.image} alt="Option E" />
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
              </div>
            </div>
          </div>
        ))


          : (
            <p>Loading questions...</p>
          )

        }

        <button
          onClick={addNewQuestion}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Add New Question
        </button>
        <button onClick={handleSave} 
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
            Save Document
        </button>
      </div>
    </div>
  )
};

export default True;
