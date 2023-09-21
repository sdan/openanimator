import OpenAI from 'openai';
import {
  ChatCompletionMessage,
  ChatCompletionChunk,
  CreateChatCompletionRequestMessage,
  CompletionCreateParams
} from 'openai/resources/chat';

export const functions: CompletionCreateParams.Function[] = [
  {
    name: 'math_animation',
    description: 'Create an educational math animation using Manim 0.6.0.  The script should not only animate the requested concept but also include multiple animations within the scene to provide a thorough explanation of the concept.',
    parameters: {
      type: 'object',
      properties: {
        manim_code: {
          type: 'string',
          description: 'A documented Manim 0.6.0 script in Python in an educational way.',
        }
      },
      required: ['manim_code']
    }
  }
  // },   
  // {
  //   name: 'get_weather',
  //   description: 'Get the current weather for a city.',
  //   parameters: {
  //     type: 'object',
  //     properties: {
  //       city: {
  //         type: 'string',
  //         description: 'The city to get the weather for.',
  //       }
  //     },
  //     required: ['city']
  //   }
  // },
  // {
  //   name: 'pdf_retrieval',
  //   description: 'Returns a text chunks most relevant to the user query from the provided PDF. You will use synthesize the text as if you are a researcher at Harvard in order to answer questions eloquently from the provided text chunks and sources. A plugin that allows users to load and query PDF documents or Google Drive documents using ChatGPT. Users must first provide a PDF URL for processing. Users can query, analyze, or ask questions from that PDF name without needing to specify everytime. User must provide a PDF or Google Drive link that can be publically accessible, only documents can be loaded. The query will be able to extract relevant parts of the document to the users request. The load may take a while to process and if it does not work on the first try, try again, unless you get an error message back. User can only load documents that can be publically accessible on the internet.',
  //   parameters: {
  //     type: 'object',
  //     properties: {
  //       query: {
  //         type: 'string',
  //         description: 'The query or question to ask based on the PDF document.',
  //       },
  //       pdf_url: {
  //         type: 'string',
  //         format: 'uri',
  //         description: 'The temporary URL of the PDF document that is already loaded.',
  //       }
        
  //     },
  //     required: ['query', 'pdf_url']
  //   }
  // },
  // {
  //   name: 'video_retrieval',
  //   description: 'Returns a transcript of the video most relevant to the user query. The user must provide a video ID and a query.',
  //   parameters: {
  //     type: 'object',
  //     properties: {
  //       query: {
  //         type: 'string',
  //         description: 'The query or question to ask based on the video.',
  //       },
  //       video_id: {
  //         type: 'string',
  //         description: 'The ID of the video to retrieve.',
  //       }
  //     },
  //     required: ['query', 'video_id']
  //   }
  // },
  // {
  //   name: 'web_retrieval',
  //   description: 'Returns a text chunks most relevant to the user query from the provided URL. You will use synthesize the text as if you are a researcher at Harvard in order to answer questions eloquently from the provided text chunks and sources. A plugin that allows users to load and query webpages using ChatGPT. Users must first provide a URL for processing. Users can query, analyze, or ask questions from that webpage without needing to specify everytime. User must provide a URL that can be publically accessible, only webpages can be loaded. The query will be able to extract relevant parts of the webpage to the users request. The load may take a while to process and if it does not work on the first try, try again, unless you get an error message back. User can only load webpages that can be publically accessible on the internet.',
  //   parameters: {
  //     type: 'object',
  //     properties: {
  //       query: {
  //         type: 'string',
  //         description: 'The query or question to ask based on the webpage.',
  //       },
  //       url: {
  //         type: 'string',
  //         description: 'The URL of the webpage to retrieve. Must be publically accessible. And must be a webpage.',
  //       }
  //     },
  //     required: ['query', 'url']
  //   }
  // }
]

// export async function callFunction(function_call: ChatCompletionMessage.FunctionCall): Promise<any> {
//   const args = JSON.parse(function_call.arguments!);
//   console.log("call function args", args);
//   switch (function_call.name) {
//     case 'get_weather':
//       return await getWeather(args['city']);
//     case 'pdf_retrieval':
//       return await chatWithPdfRetriever(args['query'], args['pdf_url']);
//     case 'video_retrieval':
//       return await chatWithVideoRetriever(args['query'], args['video_id']);
//     default:
//       throw new Error('No function found');
//   }
// }

export async function chatWithWebRetriever(query: string, url: string) {
  // https://web.scraper.workers.dev/?url=suryad.com&selector=p%2C+a&scrape=text&pretty=true

  // expected output
  // {
  //   "result": {
  //     "p": [
  //       "functioncalling.fun",
  //       "Serve

  const webServer = "https://web.scraper.workers.dev";

  // GET request to load the webpage

  const loadResponse = await fetch(`${webServer}/?url=${url}&selector=p%2C+a&scrape=text`);

  
  if (!loadResponse.ok) {
    throw new Error(`Failed to load webpage. Status: ${loadResponse.status}`);
  }

  // Get the response from the second call
  const response = await loadResponse.json();

  // Safely log the response
  console.log(response);

  // Return the response
  return response;

}

export async function chatWithVideoRetriever(query: string, video_id: string) {
  
  const videoServer = "***REMOVED***/video/load";

  // expected input:
  // {
  //   "video_id": "aWTk37I-Ygo",
  //   "video_query": "tell me everything about this video"
  // }

// expected output
  // {
  //   "transcript": [
  //     "oder\nkochfeld befindet sic
  //   ]
  // }

  const videoResponse = await fetch(videoServer, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "video_id": video_id,
      "video_query": query,
    }),
  });

  if (!videoResponse.ok) {
    throw new Error(`Failed to load video. Status: ${videoResponse.status}`);
  }
  return await videoResponse.json();
}

export async function chatWithPdfRetriever(query: string, pdf_url: string) {
  
  const loadUrl = "***REMOVED***/pdf/load";
  const queryUrl = "***REMOVED***/pdf/query";

  // First POST request to load the PDF
  const loadResponse = await fetch(loadUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "pdf_url": pdf_url,
    }),
  });

  if (!loadResponse.ok) {
    throw new Error(`Failed to load PDF. Status: ${loadResponse.status}`);
  }

  // Second POST request to query the loaded PDF
  const queryResponse = await fetch(queryUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "query": query,
      "pdf_url": pdf_url,
    }),
  });

  if (!queryResponse.ok) {
    throw new Error(`Failed to query PDF. Status: ${queryResponse.status}`);
  }

  // Get the response from the second call
  const response = await queryResponse.json();

  // Safely log the response
  console.log(response);

  // Return the response
  return response;
}

export async function getWeather(city: string) {
  try {
    const response = await fetch(`https://wttr.in/${city}?format=j1`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${city}`);
    }
    const jsonData = await response.json();
    const feelsLikeF = jsonData.current_condition[0].FeelsLikeF;
    const weatherDescription = jsonData.current_condition[0].weatherDesc[0].value;
    return `${city}: ${feelsLikeF}, ${weatherDescription}`;
  } catch (error) {
    throw new Error(`Failed to fetch weather data: ${error}`);
  }
}

export async function chatWithMathAnimation(manim_code: string) {
  console.log("script\n", manim_code);
  console.log("in chatWithMathAnimation");
  const url = "***REMOVED***/generate_animation_from_string";
  console.log("heres what the body looks like", JSON.stringify({
    code: manim_code,
  }));
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: manim_code,
    }),
  });


  if (!response.ok) {
    const data = await response.json();
    console.log("[ERROR] chat animation response not OK", data);
    return `Failed to generate animation. Please call math_animation again because you have failed to produce a correct Manim script. Status: ${response.status}`;
  }

  const data = await response.json();
  console.log("chat animation response OK", data);
  const vid_id =  data.id;
  // ***REMOVED***/get_video_id/a4b649c3-8a6d-4933-b891-c86b95a0314d
  console.log(`Display this video in markdown ***REMOVED***/get_video/${vid_id}`);
  return `Output video of the math animation <video src="***REMOVED***/get_video/${vid_id}" type="video/mp4"></video>';`;
}
