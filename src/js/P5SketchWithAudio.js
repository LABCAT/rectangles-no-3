import React, { useRef, useEffect } from "react";
import * as p5 from "p5";
import Tone from 'tone'
import { Midi } from '@tonejs/midi'

import audio from "../audio/rectangles-no-3.ogg";
import midi from "../audio/rectangles-no-3.mid";

const P5SketchWithAudio = () => {
    Tone.Transport.PPQ = 3840 * 4;
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.colours = [
          {
            r: 0,
            g: 0,
            b: 0,
          },
          {
            r: 255,
            g: 255,
            b: 255,
          },
        //   {
        //     r: 123,
        //     g: 123,
        //     b: 123,
        //   },
          {
            r: 221,
            g: 1,
            b: 0,
          },
          {
            r: 34,
            g: 80,
            b: 149,
          },
          {
            r: 250,
            g: 201,
            b: 1,
          },
        ];

        p.preload = () => {
             Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result.tracks);
                    const noteSet1 = result.tracks[3].notes; // Sampler 1 - Heavy guitar
                    p.player = new Tone.Player(audio, () => { p.audioLoaded = true; }).toMaster();
                    p.player.sync().start(0);
                    let lastTicks = -1;
                    for (let i = 0; i < noteSet1.length; i++) {
                        const note = noteSet1[i],
                            { ticks, time } = note;
                        if(ticks !== lastTicks){
                            Tone.Transport.schedule(
                                () => {
                                    p.executeCueSet1(note);
                                }, 
                                time
                            );
                            lastTicks = ticks;
                        }
                    } 
                }
            );
        }

        p.multipliers = [];
        
        p.rectangleGrid = [];

        p.cellWidth = 0;

        p.cellHeight = 0;

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.background(255);
            p.stroke(0);
            p.strokeWeight(4);
            p.noLoop();
            p.cellWidth = p.width / 16;
            p.cellHeight = p.height / 16;

            for (let i = 1; i <= 4; i++) {
                p.multipliers.push(i);
            }
            for (let i = 1; i <= 16; i++) {
                for (let j = 1; j <= 16; j++) {
                    p.rectangleGrid.push(
                        {
                            x: i,
                            y: j, 
                            empty: true
                        }
                    );
                }
            }
        };

        p.draw = () => {
            // let spaceAvailable = p.rectangleGrid.some((obj) => obj.empty);
            // while(spaceAvailable) {
            //     const colour = p.random(p.colours), 
            //         cell = p.random(p.rectangleGrid.filter((obj) => obj.empty)),
            //         { x, y } = cell;
            //     let widthMultiplier = x < 16 ? p.random(p.multipliers) : 1,
            //         heightMultiplier = y < 16 ? p.random(p.multipliers) : 1;
            //     widthMultiplier = x + widthMultiplier > 16 ? 17 - x : widthMultiplier;
            //     heightMultiplier = y + heightMultiplier > 16 ? 17 - y : heightMultiplier;
            //     p.fill(colour.r, colour.g, colour.b);
            //     p.rect(p.cellWidth * x - p.cellWidth, p.cellHeight * y - p.cellHeight, p.cellWidth * widthMultiplier, p.cellHeight * heightMultiplier);
            //     for (let i = x; i < (x + widthMultiplier); i++) {
            //         for (let j = y; j < (y + heightMultiplier); j++) {
            //             const index = p.rectangleGrid.findIndex((obj) => obj.x === i && obj.y === j); 
            //             p.rectangleGrid[index].empty = false;
                        
            //         }
            //     }
            //     spaceAvailable = p.rectangleGrid.some((obj) => obj.empty);
            // }
            
        };

        p.executeCueSet1 = (note) => {
            p.createComposition();
            for (let i = 0; i < p.rectangles.length; i++) {
                const colour = p.random(p.colours),
                    rectangle = p.rectangles[i],
                    { x, y, widthMultiplier, heightMultiplier } = rectangle;
                p.fill(colour.r, colour.g, colour.b);
                p.rect(p.cellWidth * x - p.cellWidth, p.cellHeight * y - p.cellHeight, p.cellWidth * widthMultiplier, p.cellHeight * heightMultiplier);
            }
        };

        p.rectangles = [];

        p.createComposition = () => {
            p.rectangles = [];
            p.rectangleGrid = p.rectangleGrid.map(obj => ({...obj, empty: true}));
            let spaceAvailable = p.rectangleGrid.some((obj) => obj.empty);
            while(spaceAvailable) {
                const cell = p.random(p.rectangleGrid.filter((obj) => obj.empty)),
                    { x, y } = cell;
                let widthMultiplier = x < 16 ? p.random(p.multipliers) : 1,
                    heightMultiplier = y < 16 ? p.random(p.multipliers) : 1;
                widthMultiplier = x + widthMultiplier > 16 ? 17 - x : widthMultiplier;
                heightMultiplier = y + heightMultiplier > 16 ? 17 - y : heightMultiplier;
                p.rectangles.push(
                    {
                        x: x,
                        y: y,
                        widthMultiplier: widthMultiplier,
                        heightMultiplier: heightMultiplier,
                    } 
                )
                for (let i = x; i < (x + widthMultiplier); i++) {
                    for (let j = y; j < (y + heightMultiplier); j++) {
                        const index = p.rectangleGrid.findIndex((obj) => obj.x === i && obj.y === j); 
                        p.rectangleGrid[index].empty = false;
                        
                    }
                }
                spaceAvailable = p.rectangleGrid.some((obj) => obj.empty);
            }
        };

        p.mousePressed = () => {
            if(p.audioLoaded){
                 if (p.player.state === "started") {
                    Tone.Transport.pause(); // Use the Tone.Transport to pause audio
                } 
                else if (p.player.state === "stopped") {
                    Tone.Transport.start(); // Use the Tone.Transport to start again
                }
            }
        };

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.redraw();
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
        </div>
    );
};

export default P5SketchWithAudio;
