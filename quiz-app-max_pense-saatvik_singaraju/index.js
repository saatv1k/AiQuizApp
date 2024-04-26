const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors')
const fs = require("fs"); // Move fs require to top since it does not need to be inside the function

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors())

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get('/generate-quiz', async (req, res) => {
  try {
        // Specify 'utf8' to ensure the content is read as a string
        var promptText = fs.readFileSync("./prompt_rand.txt", "utf8"); 
        console.log("File read successfully");
        const response = await openai.chat.completions.create({    
            messages: [
                {
                    role: "user", 
                    content: promptText
                }
            ],
            model: "gpt-4-turbo", // Adjust model as needed
        });
        res.json(JSON.parse(response.choices[0].message.content)); // Make sure response structure is correct
  } catch (error) {
        console.error("Error in generating quiz:", error); // More detailed error logging
        res.status(500).json({ error: error.message });
  }
});

app.post('/learning-quiz', async (req, res) => {
    try {
        const{ score } = req.body
        console.log(score)
        // Specify 'utf8' to ensure the content is read as a string
        var promptText = fs.readFileSync("./prompt_rand.txt", "utf8");
        if(score < 0.25) 
        {
            promptText = fs.readFileSync("./prompt_level1.txt", "utf8");
        }
        else if (score < 0.5)
        {
            promptText = fs.readFileSync("./prompt_level2.txt", "utf8");
        }
        else if (score < 0.75)
        {
            promptText = fs.readFileSync("./prompt_level3.txt", "utf8");
        }
        else
        {
            promptText = fs.readFileSync("./prompt_level4.txt", "utf8");
        }
        console.log("File read successfully");
        const response = await openai.chat.completions.create({    
            messages: [
                {
                    role: "user", 
                    content: promptText
                }
            ],
            model: "gpt-4-turbo", // Adjust model as needed
        });
        res.json(JSON.parse(response.choices[0].message.content)); // Make sure response structure is correct
    } catch (error) {
        console.error("Error in generating quiz:", error); // More detailed error logging
        res.status(500).json({ error: error.message });
    }
  });


app.post('/feedback', async (req, res) => {
    const { results } = req.body;
    console.log(results)
    try {
        const response = await openai.chat.completions.create({    
        messages: [
            {
                role: "user", 
                content: "The user took a quiz and the results are as follows. Your job is to give them feedback and comment on what they did right or wrong. Be sure to say why they got certain problems wrong and give them extra background information for additional help"
                    + JSON.stringify(results)
            }
        ],
        model: "gpt-4-turbo", // Adjust model as needed
    });
    console.log(response.choices[0].message.content)
    res.json(response.choices[0].message.content);
    } catch (error) {
      console.error('Failed to generate feedback:', error);
      res.status(500).json({ error: 'Failed to generate feedback' });
    }
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
