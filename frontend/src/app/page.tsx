"use client";

import {
  Button,
  Center,
  Container,
  Grid,
  Text,
  Loader,
  Textarea,
  Title,
  Anchor,
  ThemeIcon,
  Flex,
} from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
import { ChangeEvent, useEffect, useState } from "react";
import Markdown from "react-markdown";

const MAX_CHARS = 300;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [modelResponse, setModelResponse] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = event.currentTarget.value;
    if (newInput.length <= MAX_CHARS) setUserInput(newInput);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await fetch("/api/search", {
        method: "POST",
        body: JSON.stringify({ query: userInput }),
      });
      const json = await result.json();
      setModelResponse(json.response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/search", { method: "OPTIONS" });
  }, []);

  useEffect(() => {
    setIsSubmitDisabled(
      isLoading || !userInput || userInput.length > MAX_CHARS
    );
  }, [isLoading, userInput]);

  return (
    <div
      style={{
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        flexDirection: "column",
        marginTop: "12px",
      }}
    >
      <Container size="sm" mb={24}>
        <Title order={1} style={{ textAlign: "center" }}>
          Legacy - Mental Health MVP
        </Title>
        <Text style={{ textAlign: "center" }}>
          Enter an issue you are facing with a patient to get recommendations.
        </Text>
      </Container>
      <Container
        style={{
          borderRadius: 12,
          borderStyle: "solid",
          borderWidth: 2,
          borderColor: "#5FA377",
          boxShadow: "5px 5px 5px rgba(0,0,0,0.1)",
        }}
        pt={12}
        pb={12}
        mb={24}
        w={"80%"}
      >
        <Container mih={248}>
          {isLoading ? (
            <Center>
              <Loader size="lg" />
            </Center>
          ) : modelResponse ? (
            <Markdown>{modelResponse}</Markdown>
          ) : (
            <Center>
              <Text style={{ opacity: 0.6 }}>
                Ask me for help with your patients.
              </Text>
            </Center>
          )}
        </Container>

        <Container>
          <Grid
            type="container"
            breakpoints={{
              xs: "100px",
              sm: "200px",
              md: "400px",
              lg: "762px",
              xl: "1000px",
            }}
          >
            <Grid.Col>
              <Textarea
                placeholder="Enter a challenge you are facing with your patient"
                value={userInput}
                disabled={isLoading}
                onChange={handleTextChange}
                autosize
                minRows={2}
              />
            </Grid.Col>
            <Grid.Col>
              <Text style={{ textAlign: "end" }}>
                {userInput.length}/{MAX_CHARS}
              </Text>
            </Grid.Col>
            <Grid.Col
              span={{ base: 12, md: 6, lg: 2 }}
              offset={{ base: 0, md: 6, lg: 10 }}
            >
              <Button
                fullWidth
                variant="filled"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                Get Help
              </Button>
            </Grid.Col>
          </Grid>
        </Container>
      </Container>
      <Anchor
        href="https://github.com/zacharyjarnagin/legacy-mvp"
        target="_blank"
      >
        <Flex justify="center" align="center">
          <Text>View on</Text>
          <ThemeIcon variant="white">
            <IconBrandGithub style={{ width: "70%", height: "70%" }} />
          </ThemeIcon>
          <Text>GitHub</Text>
        </Flex>
      </Anchor>
    </div>
  );
}
