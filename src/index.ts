import { Hono } from 'hono'
import { mockAI } from './mockAI';

interface Env {
  AI?: any;
}

interface CloudflareBindings extends Env {}

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', (c) => {
  return c.html(`
    <html>
      <head>
        <title>Star Wars Trivia</title>
        <style>
          body {
            font-family: 'Star Jedi', Arial, sans-serif;
            background-image: url('https://wallpaperaccess.com/full/11801.jpg');
            background-size: cover;
            background-attachment: fixed;
            color: #FFD700;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .game-container {
            background-color: rgba(0, 0, 0, 0.8);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            max-width: 600px;
            width: 100%;
          }
          h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
          }
          #question {
            font-size: 1.2em;
            margin-bottom: 20px;
          }
          #answer {
            width: 80%;
            padding: 10px;
            margin-bottom: 10px;
            font-size: 1em;
          }
          button {
            background-color: #FFD700;
            color: #000;
            border: none;
            padding: 10px 20px;
            font-size: 1em;
            cursor: pointer;
            margin: 5px;
          }
          #timer {
            font-size: 1.5em;
            margin-bottom: 10px;
          }
          #score {
            font-size: 1.2em;
            margin-bottom: 10px;
          }
          #leaderboard {
            margin-top: 20px;
          }
          .difficulty {
            margin-bottom: 10px;
          }
          .difficulty button.active {
            background-color: #FF4500;
          }
        </style>
      </head>
      <body>
        <div class="game-container">
          <h1>Star Wars Trivia</h1>
          <div class="difficulty">
            <button id="easy">Easy</button>
            <button id="medium" class="active">Medium</button>
            <button id="hard">Hard</button>
          </div>
          <div id="score">Score: 0</div>
          <div id="timer">Time: 30</div>
          <div id="question">Loading question...</div>
          <input type="text" id="answer" placeholder="Enter your answer">
          <button onclick="checkAnswer()">Submit Answer</button>
          <div id="result"></div>
          <div id="leaderboard">
            <h2>Top Scores</h2>
            <ol id="top-scores"></ol>
          </div>
        </div>
        <script>
          let currentQuestion = { question: '', answer: '' };
          let score = 0;
          let timer;
          let timeLeft = 30;
          let difficulty = 'medium';

          function updateScore(points) {
            score += points;
            document.getElementById('score').textContent = 'Score: ' + score;
          }

          function updateLeaderboard() {
            let scores = JSON.parse(localStorage.getItem('starWarsTriviScores') || '[]');
            scores.push(score);
            scores.sort((a, b) => b - a);
            scores = scores.slice(0, 5);
            localStorage.setItem('starWarsTriviScores', JSON.stringify(scores));

            const leaderboard = document.getElementById('top-scores');
            leaderboard.innerHTML = '';
            scores.forEach((s, i) => {
              const li = document.createElement('li');
              li.textContent = s;
              leaderboard.appendChild(li);
            });
          }

          function startTimer() {
            clearInterval(timer);
            timeLeft = difficulty === 'easy' ? 45 : (difficulty === 'medium' ? 30 : 15);
            document.getElementById('timer').textContent = 'Time: ' + timeLeft;
            timer = setInterval(() => {
              timeLeft--;
              document.getElementById('timer').textContent = 'Time: ' + timeLeft;
              if (timeLeft <= 0) {
                clearInterval(timer);
                checkAnswer();
              }
            }, 1000);
          }

          async function fetchQuestion() {
            try {
              const categories = ['people', 'planets', 'starships'];
              const category = categories[Math.floor(Math.random() * categories.length)];
              const id = Math.floor(Math.random() * 10) + 1;
              const url = 'https://swapi.dev/api/' + category + '/' + id + '/';
              
              const response = await fetch(url);
              if (!response.ok) throw new Error('Failed to fetch Star Wars data');
              const data = await response.json();
              
              const aiResponse = await fetch('/generate-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, context: JSON.stringify(data) })
              });
              
              const aiData = await aiResponse.json();
              
              if (!aiResponse.ok || aiData.error) {
                throw new Error(aiData.error || 'Failed to generate question');
              }
              
              currentQuestion = { 
                question: aiData.question.replace(/_/g, ' '), 
                answer: aiData.answer.replace(/_/g, ' ')
              };
              document.getElementById('question').textContent = currentQuestion.question;
              document.getElementById('answer').value = '';
              document.getElementById('result').textContent = '';
              startTimer();
            } catch (error) {
              console.error('Error fetching question:', error);
              document.getElementById('question').textContent = 'Failed to load question: ' + error.message;
            }
          }

          async function checkAnswer() {
            clearInterval(timer);
            const userAnswer = document.getElementById('answer').value.toLowerCase();
            const result = document.getElementById('result');
            if (userAnswer === currentQuestion.answer.toLowerCase()) {
              result.textContent = 'Correct!';
              updateScore(difficulty === 'easy' ? 1 : (difficulty === 'medium' ? 2 : 3));
            } else {
              result.textContent = 'Incorrect. The correct answer is ' + currentQuestion.answer + '.';
              updateScore(difficulty === 'easy' ? -1 : (difficulty === 'medium' ? -2 : -3));
            }
            updateLeaderboard();
            setTimeout(fetchQuestion, 3000);
          }

          document.getElementById('answer').addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
              checkAnswer();
            }
          });

          ['easy', 'medium', 'hard'].forEach(diff => {
            document.getElementById(diff).addEventListener('click', function() {
              difficulty = diff;
              document.querySelectorAll('.difficulty button').forEach(btn => btn.classList.remove('active'));
              this.classList.add('active');
              fetchQuestion();
            });
          });

          fetchQuestion();
        </script>
      </body>
    </html>
  `)
})

app.post('/generate-question', async (c) => {
  console.log('Received request to generate question');
  const { category, context } = await c.req.json()
  console.log('Category:', category);
  console.log('Context:', context);

  try {
    const aiService = c.env.AI || mockAI;
    console.log('Using AI service:', aiService === mockAI ? 'mockAI' : 'real AI');
    const ai = await aiService.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [{ role: 'user', content: `Generate a short, interesting trivia question about this ${category} from Star Wars. The question should be clear and make sense. Use the following data: ${context}` }],
      max_tokens: 50,
      temperature: 0.7,
    })
    console.log('AI response:', ai);

    if (!ai.response) {
      throw new Error('AI returned an empty response');
    }

    const { question, answer } = parseAIResponse(ai.response, JSON.parse(context));
    console.log('Parsed question:', question);
    console.log('Parsed answer:', answer);
    return c.json({ question, answer })
  } catch (error) {
    console.error('Error generating question:', error);
    // Fallback to generating a simple question
    const { question, answer } = generateSimpleQuestion(JSON.parse(context), category);
    return c.json({ question, answer })
  }
})

function parseAIResponse(response: string, context: any): { question: string, answer: string } {
  if (!response || typeof response !== 'string') {
    throw new Error('Invalid AI response');
  }

  const lines = response.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length < 1) {
    throw new Error('AI response does not contain a question');
  }

  const question = lines[0].trim();
  let answer = 'Unable to determine';

  // Try to find an answer in the remaining lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.startsWith('answer:')) {
      answer = lines[i].substring(7).trim();
      break;
    }
  }

  // If no answer was found in the AI response, try to extract it from the context
  if (answer === 'Unable to determine') {
    const questionLower = question.toLowerCase();
    for (const [key, value] of Object.entries(context)) {
      if (questionLower.includes(key.toLowerCase()) && typeof value === 'string') {
        answer = value;
        break;
      }
    }
  }

  return { question, answer };
}

function generateSimpleQuestion(context: any, category: string): { question: string, answer: string } {
  const interestingKeys = ['name', 'climate', 'terrain', 'population', 'diameter', 'rotation_period', 'orbital_period', 'gravity', 'height', 'mass', 'hair_color', 'skin_color', 'eye_color', 'birth_year', 'gender', 'model', 'manufacturer', 'cost_in_credits', 'length', 'max_atmosphering_speed', 'crew', 'passengers', 'cargo_capacity', 'consumables', 'hyperdrive_rating', 'starship_class'];
  
  const availableKeys = interestingKeys.filter(key => context[key] && typeof context[key] === 'string' && context[key] !== 'unknown' && context[key] !== 'n/a');
  
  if (availableKeys.length === 0) {
    return {
      question: `What is the name of this ${category === 'people' ? 'character' : category.slice(0, -1)}?`,
      answer: context.name || 'Unknown'
    };
  }

  const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
  const value = context[randomKey];

  let question: string;
  switch (category) {
    case 'people':
      switch (randomKey) {
        case 'name':
          question = `What is the name of this Star Wars character?`;
          break;
        case 'height':
          question = `How tall is ${context.name} in centimeters?`;
          break;
        case 'mass':
          question = `What is the mass of ${context.name} in kilograms?`;
          break;
        case 'hair_color':
        case 'skin_color':
        case 'eye_color':
          question = `What is the ${randomKey.replace('_', ' ')} of ${context.name}?`;
          break;
        case 'birth_year':
          question = `In what year was ${context.name} born?`;
          break;
        case 'gender':
          question = `What is the gender of ${context.name}?`;
          break;
        default:
          question = `What is the ${randomKey.replace(/_/g, ' ')} of ${context.name}?`;
      }
      break;
    case 'planets':
      switch (randomKey) {
        case 'name':
          question = `What is the name of this Star Wars planet?`;
          break;
        case 'climate':
        case 'terrain':
          question = `What is the ${randomKey} of the planet ${context.name}?`;
          break;
        case 'population':
          question = `What is the population of the planet ${context.name}?`;
          break;
        case 'diameter':
          question = `What is the diameter of the planet ${context.name} in kilometers?`;
          break;
        case 'rotation_period':
          question = `How long is a day on the planet ${context.name} in standard hours?`;
          break;
        case 'orbital_period':
          question = `How long is a year on the planet ${context.name} in standard days?`;
          break;
        case 'gravity':
          question = `What is the gravity on the planet ${context.name} compared to standard gravity?`;
          break;
        default:
          question = `What is the ${randomKey.replace(/_/g, ' ')} of the planet ${context.name}?`;
      }
      break;
    case 'starships':
      switch (randomKey) {
        case 'name':
          question = `What is the name of this Star Wars starship?`;
          break;
        case 'model':
        case 'manufacturer':
          question = `What is the ${randomKey} of the starship ${context.name}?`;
          break;
        case 'cost_in_credits':
          question = `How much does the starship ${context.name} cost in credits?`;
          break;
        case 'length':
          question = `What is the length of the starship ${context.name} in meters?`;
          break;
        case 'max_atmosphering_speed':
          question = `What is the maximum atmosphering speed of the starship ${context.name}?`;
          break;
        case 'crew':
          question = `How many crew members are required to operate the starship ${context.name}?`;
          break;
        case 'passengers':
          question = `How many passengers can the starship ${context.name} carry?`;
          break;
        case 'cargo_capacity':
          question = `What is the cargo capacity of the starship ${context.name} in kilograms?`;
          break;
        case 'consumables':
          question = `How long can the starship ${context.name} operate without resupplying?`;
          break;
        case 'hyperdrive_rating':
          question = `What is the hyperdrive rating of the starship ${context.name}?`;
          break;
        case 'starship_class':
          question = `What is the class of the starship ${context.name}?`;
          break;
        default:
          question = `What is the ${randomKey.replace(/_/g, ' ')} of the starship ${context.name}?`;
      }
      break;
    default:
      question = `What is the ${randomKey.replace(/_/g, ' ')} of this ${category === 'people' ? 'character' : category.slice(0, -1)}?`;
  }

  return { question, answer: value };
}

export default app