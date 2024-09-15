interface CloudflareBindings {
  AI: {
    run: (model: string, options: any) => Promise<{ response: string }>;
  } | undefined;
}
