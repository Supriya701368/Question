import { useState, useEffect } from "react";
import './Questions.css'; // Import the CSS file
import { Document, Packer,PageBreak , Paragraph, ImageRun } from "docx";

const MCQ = ({
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
                                    className="option box"
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
                            <h4>Options</h4>
                            {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="option-item">
                                    <div>
                                        <label className="option-label">
                                            <input
                                                name="radio"
                                                type="radio"
                                                value={option.isCorrect}
                                                onChange={(e) => handleAnswerChange(index, optionIndex, e.target.checked)}
                                                className="option-box"
                                            />
                                            <span>Option {String.fromCharCode(65 + optionIndex)}</span>
                                        </label>
                                        <div
                                            onPaste={(e) => handleOptionPaste(e, index, optionIndex)}
                                            className="option-box"
                                        >
                                            {option.image ? (
                                                <>
                                                    <img
                                                        src={option.image}
                                                        alt={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                                        style={{ maxWidth: '100%' }}
                                                    />
                                                    <button
                                                        onClick={() => handleRemoveImage(index, "option", optionIndex)}
                                                        className="remove-button"
                                                    >
                                                        Remove
                                                    </button>
                                                </>
                                            ) : (
                                                "Paste your option image here"
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {addOptionE && question.options.length < 5 && (
                                <div className="option-item">
                                    <label>
                                        <input
                                            name="radio"
                                            type="radio"
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
                                                <img   style={{ maxWidth: '100%' }}
                                                src={question.options[4].image} alt="Option E" />
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
                                    className="option-box"
                                    onPaste={(e) => handlePaste(e, index)}
                                >
                                    {question.solutionImage ? (
                                        <>
                                            <img
                                                src={question.solutionImage}
                                                alt={`Solution ${index + 1}`}
                                                style={{ maxWidth: '100%' }}
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
                                        onPaste={(e) => handlePaste(e, index)}

                                    >
                                        {question.solutionImage ? (
                                            <>
                                                <img
                                                       style={{ maxWidth: '100%' }}
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
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
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
                    onClick={(data) => { handleSave(data) }}
                    className="save-button"
                >
                    Save Document
                </button>
            </div>
        </div>
    );
};

export default MCQ;
