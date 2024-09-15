
# Star Wars Trivia Game

## Description

This is a web-based Star Wars Trivia game built using Cloudflare Workers and Hono. The game presents users with trivia questions about the Star Wars universe, pulling data from the Star Wars API (SWAPI) to generate questions dynamically. The game features a visually appealing interface with a Star Wars-themed background, including a hyperdrive animation and the iconic opening crawl text.

## Features

- Dynamic trivia questions generated from SWAPI data
- Categories include people, planets, and starships from the Star Wars universe
- Real-time answer checking
- Star Wars-themed UI with hyperdrive animation and opening crawl text
- Responsive design for various screen sizes

## Technologies Used

- Cloudflare Workers
- TypeScript
- Hono (lightweight web framework for Cloudflare Workers)
- SWAPI (Star Wars API)
- HTML5 & CSS3

## Live Demo

The game is deployed and can be played at: [https://cursor.star-wars-trivia-123.workers.dev/](https://cursor.star-wars-trivia-123.workers.dev/)

## Local Development

To set up this project locally:

1. Clone the repository
2. Install dependencies:

   ```

   npm install

   ```
3. Run the development server:

   ```

   npm run dev

   ```

## Deployment

To deploy updates to Cloudflare Workers:

1. Ensure you're logged in to your Cloudflare account with Wrangler
2. Run the deploy command:

   ```

   npm run deploy

   ```

## Project Structure

-`src/index.ts`: Main application file containing the game logic and HTML structure

-`src/mockAI.ts`: Mock AI service for local development

-`wrangler.toml`: Configuration file for Cloudflare Workers

-`package.json`: Project dependencies and scripts

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check [issues page] if you want to contribute.

## License

[Specify your license here]

## Author

[Your Name]

## Acknowledgments

- Star Wars API (SWAPI) for providing the data
- Cloudflare Workers for hosting and serverless functionality
- Hono framework for simplifying worker development
