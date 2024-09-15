export const mockAI = {
  run: async (model: string, { messages }: { messages: Array<{ role: string, content: string }> }) => {
    const prompt = messages[0].content;
    const context = JSON.parse(prompt.split('Star Wars:')[1].trim());
    const keys = Object.keys(context).filter(key => key !== 'name');
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    
    return {
      response: `What is the ${randomKey} of the ${context.name}?`
    };
  }
};
