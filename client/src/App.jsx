import { useState, useEffect, useRef } from "react";
import { Stage, Layer, Line } from "react-konva";
import { io } from "socket.io-client";

const socket = io();

const App = () => {
    const STAGE_WIDTH = 1920;
    const STAGE_HEIGHT = 1080;

    const isDrawing = useRef(false);
    const [scale, setScale] = useState(1);
    const [lines, setLines] = useState([]);
    const [currentLine, setCurrentLine] = useState({});

    const handleResize = () => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const newScale = Math.min(
            windowWidth / STAGE_WIDTH,
            windowHeight / STAGE_HEIGHT,
            1
        );
        setScale(newScale);
    };

    const handleMouseDown = (event) => {
        isDrawing.current = true;
        const pos = event.target.getStage().getPointerPosition();
        setCurrentLine({ points: [pos.x, pos.y] });
    };

    const handleMouseUp = () => {
        if (isDrawing.current) {
            setLines([...lines, currentLine]);
            socket.emit("drawing", currentLine);
            isDrawing.current = false;
        }
    };

    const handleMouseMove = (event) => {
        if (!isDrawing.current) {
            return;
        }

        const point = event.target.getStage().getPointerPosition();
        setCurrentLine({ points: [...currentLine.points, point.x, point.y] });
    };

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
        };
    });

    useEffect(() => {
        socket.on("initialize_drawing", (data) => {
            setLines((prevLines) => [...prevLines, ...data]);
        });

        socket.on("drawing", (data) => {
            setLines((prevLines) => [...prevLines, data]);
        });

        return () => {
            socket.off("initialize_drawing");
            socket.off("drawing");
        };
    }, []);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
                transform: `scale(${scale})`,
            }}
        >
            <Stage
                width={STAGE_WIDTH - 2}
                height={STAGE_HEIGHT - 2}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                style={{
                    backgroundColor: "white",
                    border: "2px solid rgb(218, 220, 224)",
                }}
            >
                <Layer>
                    {lines.map((line, i) => (
                        <Line
                            key={i}
                            points={line.points}
                            stroke={"black"}
                            strokeWidth={5}
                            tension={0}
                            lineCap="round"
                            lineJoin="round"
                            globalCompositeOperation="source-over"
                        />
                    ))}
                </Layer>
                <Layer>
                    {currentLine && (
                        <Line
                            {...currentLine}
                            stroke={"black"}
                            strokeWidth={5}
                            tension={0}
                            lineCap="round"
                            lineJoin="round"
                            globalCompositeOperation="source-over"
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default App;
