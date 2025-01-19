import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver"
import { Document, Packer,PageBreak , Paragraph, ImageRun, TextRun } from "docx";
import MCQ from "./Components/Mcq";
import MSQ from "./Components/Msq";
import NIT from "./Components/Nit";
import True from "./Components/True";
import "../src/Components/Questions.css";


const App = () => {

  const [selectedQuestionType, setSelectedQuestionType] = useState("");
  const [positiveMarks, setPositiveMarks] = useState("");
  const [negativeMarks, setNegativeMarks] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [includeParagraph, setIncludeParagraph] = useState(false); // Track "Have Paragraph"
  const [includeSolution, setIncludeSolution] = useState(false);
  const [addOptionE, setAddOptionE] = useState(false);

  const [Questions, setQuestions] = useState([
    {
      paragraphImage: null,
      questionImage: null,  // Paragraph image
      paraquestions: [           // Array to store 5 questions with their images
        { paraquestionImage: null },  // Question 1 image
        { paraquestionImage: null },  // Question 2 image
        { paraquestionImage: null },  // Question 3 image
        { paraquestionImage: null },  // Question 4 image
        { paraquestionImage: null },  // Question 5 image
      ],
      answer: "",  // Store the answer for the questions (optional)
      solutionImage: null,  // Solution image (optional)
      options: [
        { text: "", image: null },
        { text: "", image: null },
        { text: "", image: null },
        { text: "", image: null },// Option D
        ...(addOptionE ? [{ text:"",image: null }]: []), // Option E if checked
      ],
    },
  ]);

  const handlePositiveChange = (e) => {
    setPositiveMarks(e.target.value);
    console.log(positiveMarks)
  };

  const handleNegativeChange = (e) => {
    setNegativeMarks(e.target.value);
    console.log(negativeMarks)
  };
  const handleSave = async () => {
    console.log(Questions.answer);
    let sortid = 1;
    console.log("Questions data:", Questions.length);

    const questionMaxWidth = 600;
    const questionMaxHeight = 900;
    const optionMaxWidth = 200;
    const optionMaxHeight = 150;

    const docSections = [];

    // Clone questions to avoid direct mutation and cyclic references
    const clonedQuestions = JSON.parse(JSON.stringify(Questions));

    for (let index = 0; index < clonedQuestions.length; index++) {
        const question = clonedQuestions[index];

        // Process images
        const paragraphImageTransform = question.paragraphImage
            ? await processImage(question.paragraphImage, questionMaxWidth, questionMaxHeight)
            : null;

        const questionImageTransform = question.questionImage
            ? await processImage(question.questionImage, questionMaxWidth, questionMaxHeight)
            : null;

        const solutionImageTransform = question.solutionImage
            ? await processImage(question.solutionImage, questionMaxWidth, questionMaxHeight)
            : null;

        // Process paragraph question images
        const paraquestionsParagraphs = [];
        for (let i = 0; i < question.paraquestions.length; i++) {
            const paraquestion = question.paraquestions[i];
            if (paraquestion.paraquestionImage) {
                const paraquestionImageTransform = await processImage(
                    paraquestion.paraquestionImage,
                    questionMaxWidth,
                    questionMaxHeight
                );

                paraquestionsParagraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: `[Question ${i + 1} Image]`, bold: true }),
                            new ImageRun({
                                data: paraquestion.paraquestionImage.split(",")[1], // Extract base64
                                transformation: paraquestionImageTransform,
                            }),
                        ],
                    })
                );
            }
        }

        const questionTextRun = question.questionImage
            ? new ImageRun({
                  data: question.questionImage.split(",")[1],
                  transformation: questionImageTransform,
              })
            : new TextRun(question.questionText || "");

        const questionParagraph = new Paragraph({
            children: [new TextRun({ text: "[Q] ", bold: true }), questionTextRun],
        });

        // Create option paragraphs if options exist
        const optionParagraphs = [];
        if (question.options.length > 0) {
            for (let i = 0; i < question.options.length; i++) {
                const option = question.options[i];
                const label = `(${String.fromCharCode(97 + i)}) `;
                const optionTransform = option.image
                    ? await processImage(option.image, optionMaxWidth, optionMaxHeight)
                    : null;

                optionParagraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: label, bold: true }),
                            option.image
                                ? new ImageRun({
                                      data: option.image.split(",")[1],
                                      transformation: optionTransform,
                                  })
                                : new TextRun(option.text),
                        ],
                    })
                );
            }
        }

        // Create solution paragraph only if options exist
        let solutionParagraph = null;
        if (question.options.length > 0 && question.solutionImage) {
            solutionParagraph = new Paragraph({
                children: [
                    new TextRun({ text: "[soln] ", bold: true }),
                    new ImageRun({
                        data: question.solutionImage.split(",")[1],
                        transformation: solutionImageTransform,
                    }),
                ],
            });
        }

        // Ensure paragraph image appears after the question
        const paragraphImageParagraph = paragraphImageTransform
            ? new Paragraph({
                  children: [
                      new TextRun({ text: "[Paragraph Image]", bold: true }),
                      new ImageRun({
                          data: question.paragraphImage.split(",")[1],
                          transformation: paragraphImageTransform,
                      }),
                  ],
              })
            : null;

        // Add question, options, answer, and solution only if necessary
        const questionSection = {
            children: [
                questionParagraph,
                ...optionParagraphs,
                new Paragraph(`[qtype] ${selectedQuestionType}`),
                new Paragraph({ text: `[ans] ${question.answer}`, bold: true }),
                new Paragraph(`[Marks] [${positiveMarks || 0}, ${negativeMarks || 0}]`),
                ...paraquestionsParagraphs,
                paragraphImageParagraph,
                new Paragraph(`[sortid] ${sortid++}`),
            ].filter(Boolean), // Remove null values
        };

        docSections.push(questionSection);
    }

    // Create the document
    const doc = new Document({
        sections: docSections,
    });

    try {
        const blob = await Packer.toBlob(doc);
        saveAs(blob, "question_with_options.docx");
        alert("Document has been downloaded successfully!");
    } catch (error) {
        console.error("Error creating the document:", error);
    }
};
 const handleQuestionTypeChange = (e) => {
       
    setSelectedQuestionType(e.target.value);

  };
  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };
  const handleAnswerChange = (index, newAnswer) => {
    const updatedQuestions = [...Questions];

    switch (selectedQuestionType) {
        case "Mcq":
        case "Msq":
            // Convert options into A, B, C, D format
            updatedQuestions[index].options = updatedQuestions[index].options.map((option, idx) => ({
                label: String.fromCharCode(65 + idx), // Converts 0 -> 'A', 1 -> 'B', etc.
                value: option.value || option, // Preserve the original option value
            }));

            if (selectedQuestionType === "Mcq") {
                // Allow only one selection
                updatedQuestions[index].answer = String.fromCharCode(65 + newAnswer);
            } else if (selectedQuestionType === "Msq") {
                // Ensure answer is an array
                if (!Array.isArray(updatedQuestions[index].answer)) {
                    updatedQuestions[index].answer = [];
                }

                if (updatedQuestions[index].answer.includes(String.fromCharCode(65 + newAnswer))) {
                    // Remove if already selected (toggle)
                    updatedQuestions[index].answer = updatedQuestions[index].answer.filter(ans => ans !== String.fromCharCode(65 + newAnswer));
                } else {
                    // Allow adding new selection only if less than 2 selected
                    if (updatedQuestions[index].answer.length < 2) {
                        updatedQuestions[index].answer.push(String.fromCharCode(65 + newAnswer));
                    } else {
                        alert("You can select only two options!"); // Restrict more than 2
                    }
                }
            }
            break;

        default:
            // Directly update answer for other question types
            updatedQuestions[index].answer = String.fromCharCode(65 + newAnswer);
          }

    console.log(updatedQuestions[index]); // Debugging output
    setQuestions(updatedQuestions);
};






  const handleCheckboxChange = (e) => {

    const { name, checked } = e.target;
    console.log(name, checked)
    if (name === "paragraph") setIncludeParagraph(checked);
    if (name === "solution") setIncludeSolution(checked);
    if (name === "optionE") {
      setAddOptionE(checked);
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => ({
          ...q,
          options: checked
            ? [...q.options, { text: "", image: null }] // Add Option E
            : q.options.slice(0, 4), // Remove Option E if unchecked
        }))
      );
    }
    console.log(Questions)
  };

  const renderComponent = () => {
    switch (selectedQuestionType) {
      case "Mcq":
        return (
          <MCQ
          handleParaQuestionPaste={handleParaQuestionPaste}
            handleAnswerChange={handleAnswerChange}
            update={setQuestions}
            handlePaste={handlePaste}
            processImage={processImage}
            Questions={Questions}
            addNewQuestion={addNewQuestion}
            handleOptionPaste={handleOptionPaste}
            handleRemoveImage={handleRemoveImage}
            removeQuestion={removeQuestion}
            includeParagraph={includeParagraph}
            includeSolution={includeSolution}
            addOptionE={addOptionE}
            handleSave={handleSave}
          />
        );
      case "Msq":
        return (
          <MSQ
            update={setQuestions}
            handlePaste={handlePaste}
            positiveMarks={positiveMarks}
            negativeMarks={negativeMarks}
            processImage={processImage}
            Questions={Questions}
            addNewQuestion={addNewQuestion}
            handleAnswerChange={handleAnswerChange}
            handleOptionPaste={handleOptionPaste}
            handleRemoveImage={handleRemoveImage}
            removeQuestion={removeQuestion}
            includeParagraph={includeParagraph}
            includeSolution={includeSolution}
            addOptionE={addOptionE}
            handleSave={handleSave}
          />
        );
      case "Nit":
        return (
          <NIT
            update={setQuestions}
            handlePaste={handlePaste}
            positiveMarks={positiveMarks}
            negativeMarks={negativeMarks}
            processImage={processImage}
            Questions={Questions}
            addNewQuestion={addNewQuestion}
            handleAnswerChange={handleAnswerChange}
            handleOptionPaste={handleOptionPaste}
            handleRemoveImage={handleRemoveImage}
            removeQuestion={removeQuestion}
            includeParagraph={includeParagraph}
            includeSolution={includeSolution}
            addOptionE={addOptionE}
            handleSave={handleSave}
          />
        );
      case "True":
        return (
          <True
            update={setQuestions}
            handlePaste={handlePaste}
            positiveMarks={positiveMarks}
            negativeMarks={negativeMarks}
            processImage={processImage}
            Questions={Questions}
            addNewQuestion={addNewQuestion}
            handleAnswerChange={handleAnswerChange}
            handleOptionPaste={handleOptionPaste}
            handleRemoveImage={handleRemoveImage}
            removeQuestion={removeQuestion}
            includeParagraph={includeParagraph}
            includeSolution={includeSolution}
            addOptionE={addOptionE}
            handleSave={handleSave}

          />
        );
      default:
        return <div style={{ textAlign: "center" }}>Select a question type to load the component.</div>;
    }
  };

  const addNewQuestion = () => {
    setQuestions((prevQuestions) => [
      ...prevQuestions,
      {
        paragraphImage: null,
        questionImage: null,  // Paragraph image
        paraquestions: [           // Array to store 5 questions with their images
          { paraquestionImage: null },  // Question 1 image
          { paraquestionImage: null },  // Question 2 image
          { paraquestionImage: null },  // Question 3 image
          { paraquestionImage: null },  // Question 4 image
          { paraquestionImage: null },  // Question 5 image
        ],
        answer: "",  // Store the answer for the questions (optional)
        solutionImage: null,  // Solution image (optional)
        options: [
          { text: "", image: null },
          { text: "", image: null },
          { text: "", image: null },
          { text: "", image: null },// Option D
          ...(addOptionE ? [{ text:"",image: null }]: []), // Option E if checked
        ],
      },
    ]);
  };
  const updateQuestion = (newMessage) => {
    setQuestions(newMessage);
  };





  const processImage = (imageData, maxWidth, maxHeight) => {
    const img = new Image();
    img.src = imageData;

    return new Promise((resolve) => {
      img.onload = () => {
        const { naturalWidth, naturalHeight } = img;
        let width = naturalWidth;
        let height = naturalHeight;

        // Resize image if it exceeds max dimensions
        if (naturalWidth > maxWidth || naturalHeight > maxHeight) {
          if (naturalWidth / maxWidth > naturalHeight / maxHeight) {
            width = maxWidth;
            height = Math.round((naturalHeight / naturalWidth) * maxWidth);
          } else {
            height = maxHeight;
            width = Math.round((naturalWidth / naturalHeight) * maxHeight);
          }
        }

        resolve({ width, height });
      };
    });
  };




  const handleRemoveImage = (index, type, questionIndex = null) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];

      switch (type) {
        case "paragraph":
          updatedQuestions[index].paragraphImage = null; // Remove paragraph image
          break;
        case "paragraph-question":
          if (questionIndex !== null) {
            updatedQuestions[index].paraquestions[questionIndex].paraquestionImage = null; // Remove paragraph question image
          }
          break;
        case "question":
          updatedQuestions[index].questionImage = null; // Remove standalone question image
          break;
        case "solution":
          updatedQuestions[index].solutionImage = null; // Remove solution image
          break;
        default:
          if (type === "option" && questionIndex !== null) {
            updatedQuestions[index].options[questionIndex].image = null; // Remove option image
          }
          break;
      }

      return updatedQuestions;
    });
  };


  const removeQuestion = (index) => {
    setQuestions((prevQuestions) => prevQuestions.filter((_, i) => i !== index));
  };

  const handlePaste = (e, index) => {
    e.preventDefault();
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith("image/")) {
        const file = clipboardItems[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          const updatedQuestions = [...Questions];
          updatedQuestions[index].solutionImage = reader.result;
          updateQuestion(updatedQuestions);
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };
  
  const handleParaQuestionPaste = (e, index, subIndex) => {
    e.preventDefault(); const clipboardItems = e.clipboardData.items; for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith("image/")) {
        const file = clipboardItems[i].getAsFile(); const reader = new FileReader(); reader.onload = () => {
          const updatedQuestions = [...Questions]; updatedQuestions[index].paraquestions[subIndex].paraquestionImage = reader.result;
          setQuestions(updatedQuestions);
        };
        reader.readAsDataURL(file); break;
      }
    }
  };
  const handleOptionPaste = (e, index, optionIndex) => {
    console.log(index,optionIndex)
    e.preventDefault();
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith("image/")) {
        const file = clipboardItems[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          const updatedQuestions = [...Questions];
          updatedQuestions[index].options[optionIndex].image = reader.result;
          updatedQuestions[index].options[optionIndex].text = "";
          updateQuestion(updatedQuestions);
        };
        reader.readAsDataURL(file);
        break;
      } else if (clipboardItems[i].type === "text/plain") {
        const text = e.clipboardData.getData("text");
        const updatedQuestions = [...Questions];
        updatedQuestions[index].options[optionIndex].text = text;
        updatedQuestions[index].options[optionIndex].image = null;
        updateQuestion(updatedQuestions);
        break;
      }
    }
  };


  return (
    <div className="container">
      <button onClick={toggleSidebar} className="sidebar-toggle">
        ☰ {/* Menu Icon */}
      </button>
      <div className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>

        <h3>Type of Question:</h3>
        <select onChange={handleQuestionTypeChange} value={selectedQuestionType}>
          <option value="">---Select Type of Question----</option>
          <option value="Mcq">MCQ</option>
          <option value="Msq">MSQ</option>
          <option value="Nit">NIT</option>
          <option value="True">True/False</option>
        </select>
        <div className="marks-container">
          <label>Marks:</label>
          <input type="number" placeholder="+ve" onChange={handlePositiveChange} />
          <input type="number" placeholder="-ve" onChange={handleNegativeChange} />
        </div>
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="paragraph"
              checked={includeParagraph}
              onChange={handleCheckboxChange}
            />{" "}
            Have Paragraph
          </label>
          <label>
            <input
              type="checkbox"
              name="solution"
              checked={includeSolution}
              onChange={handleCheckboxChange}
            />{" "}
            Have Solution
          </label>
          <label>
            <input
              type="checkbox"
              name="optionE"
              checked={addOptionE}
              onChange={handleCheckboxChange}
            />{" "}
            Add Option E
          </label>
        </div>
      </div>

      <div className="main-content">{renderComponent()}</div>

    </div>
  );
};

export default App;
