import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log(data);
    const result = await fetch(
      "https://u6jcmqqbmh.execute-api.us-east-1.amazonaws.com/Prod/",
      {
        method: "POST",
        body: JSON.stringify({
          query: data.query,
        }),
      }
    );
    console.log(JSON.stringify(result));
    const jsonResponse = await result.json();
    console.log(jsonResponse);
    return NextResponse.json(
      { response: jsonResponse.response },
      { status: result.status }
    );
  } catch (error) {
    console.error(error);
    if (
      error instanceof SyntaxError &&
      error.message == "Unexpected end of JSON input"
    ) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  try {
    const result = await fetch(
      "https://u6jcmqqbmh.execute-api.us-east-1.amazonaws.com/Prod/",
      {
        method: "OPTIONS",
      }
    );
    console.log(JSON.stringify(result));
    return NextResponse.json({ response: "" }, { status: result.status });
  } catch (error) {
    console.error(error);
    if (
      error instanceof SyntaxError &&
      error.message == "Unexpected end of JSON input"
    ) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
