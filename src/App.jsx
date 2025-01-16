import React, { useState,useEffect } from "react";
import {saveAs} from "file-saver"
import { Document,Packer, Paragraph, ImageRun,TextRun } from "docx";
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
      questionImage:null,  // Paragraph image
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
        ...(addOptionE ? [{ image: null }] : []), // Option E if checked
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
    console.log(Questions.answer)
         let sortid = 1;
         console.log("Questions data:", Questions.length);
         const questionMaxWidth = 600;
         const questionMaxHeight = 900;
         const optionMaxWidth = 200;
         const optionMaxHeight = 150;
    
         const docSections = [];
    
         // Clone questions to avoid direct mutation and potential cyclic references
         const clonedQuestions = JSON.parse(JSON.stringify(Questions));
    
         for (let index = 0; index < clonedQuestions.length; index++) {
             const question = clonedQuestions[index];
    
             // Process question image
             const questionImageTransform = question.questionImage
                 ? await processImage(question.questionImage, questionMaxWidth, questionMaxHeight)
                 : null;
    
             // Process solution image
             const solutionImageTransform = question.solutionImage
                 ? await processImage(question.solutionImage, questionMaxWidth, questionMaxHeight)
                 : null;
             const questionTextRun = question.questionImage
             ? new ImageRun({
                   data: question.questionImage.split(",")[1],
                   transformation: questionImageTransform,
               })
             : new TextRun(question.questionText || "");
  
         const solutionTextRun = question.solutionImage
             ? new ImageRun({
                   data: question.solutionImage.split(",")[1],
                   transformation: solutionImageTransform,
               })
             : new TextRun(question.solutionText || "");
             const questionPart = new TextRun({ text: "[Q] ", bold: true });
             const solutionPart = new TextRun({ text: "    [soln] ", bold: true });
             const questionParagraph = new Paragraph({
                 children: [
                     questionPart,
                     questionTextRun,
                  
                 ],
             });
             const SolutionParagraph = new Paragraph({
                 children: [
                     solutionPart,
                     solutionTextRun,
                  
                 ],
             });
             // Create option paragraphs
             const optionParagraphs = [];
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
    
             // Add question, options, and answer to document sections
             docSections.push({
                 children: [
                     questionParagraph,
                     ...optionParagraphs,
                     new Paragraph(`[qtype] ${selectedQuestionType}`),
                     new Paragraph({ text: `[ans] ${question.answer}`, bold: true }),
                     new Paragraph(`[Marks] [${positiveMarks || 0}, ${negativeMarks || 0}]`), // Dynamically include marks
                     new Paragraph(`[sortid] ${sortid++}`),
                     SolutionParagraph
                    
                 ],
             });
         }
         docSections.push({
             children: [new Paragraph(`[QQ]`) ],
         });
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

    // Helper function to convert numbers to alphabets
    const numberToAlphabet = (number) => {
        if (typeof number === "number") {
            return String.fromCharCode(64 + number); // Convert 1 -> A, 2 -> B
        }
        return number;
    };

    const question = updatedQuestions[index];

    if (question.type === "MSQ") {
        const currentAnswers = question.answer || [];
        const convertedAnswer = numberToAlphabet(newAnswer);

        // Toggle the converted answer in the MSQ answers array
        if (currentAnswers.includes(convertedAnswer)) {
            question.answer = currentAnswers.filter(
                (answer) => answer !== convertedAnswer
            );
        } else {
            question.answer = [...currentAnswers, convertedAnswer];
        }

        // Ensure at least two options are selected
        if (question.answer.length < 2) {
            alert("Please select at least two options.");
        }
    } else if (question.type === "MCQ") {
        // Convert and set the answer directly for MCQ
        question.answer = numberToAlphabet(newAnswer);
    } else {
        // For other types like NIT or TRUE, set the answer directly without conversion
        question.answer = newAnswer;
    }

    console.log(updatedQuestions);
    setQuestions(updatedQuestions);
};





  
  const handleCheckboxChange = (e) => {

    const { name, checked } = e.target;
    console.log(name,checked)
    if (name === "paragraph") setIncludeParagraph(checked);
    if (name === "solution") setIncludeSolution(checked);
    if (name === "optionE") setAddOptionE(checked);
  };

  const renderComponent = () => {
    switch (selectedQuestionType) {
      case "Mcq":
        return (
          <MCQ
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
        questionImage: null,
        solutionImage: null,
        answer: "",
        paragraph: "", // New property for paragraph
        options: [
          { image: null },
          { image: null },
          { image: null },
          { image: null },
          ...(addOptionE ? [{ image: null }] : []),
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

const handleOptionPaste = (e, index, optionIndex) => {
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
  <input type="number"  placeholder="+ve" onChange={handlePositiveChange}/>
  <input type="number"  placeholder="-ve" onChange={handleNegativeChange}/>
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
