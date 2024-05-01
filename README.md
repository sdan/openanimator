# openanimator

generate videos like 3blue1brown with ✨ai✨

https://github.com/sdan/openanimator/assets/22898443/332eef0b-0e1d-4c86-bf10-ed4d4355e980


## how it works:

frontend runs ai sdk, two function calls: generate manim code, render manim code. generate manim code uses few-shot examples to use the user's request and turn that into manim code. render manim code then is called and takes that code, cleans and santizes(lightly) and sends it to rendering engine, which simply runs that manim code and hosts it on a simple flask server

### specs:
client is a nextjs ai sdk frontend, reqs: auth0 auth, server runs independently on a dedicated machine (railway)

server is a python server that takes manim code and renders it, reqs: public endpoint

## how to run

frontend: cd client, vc dev (need to add .env and various <variables>
backend: cd server, python main.py, railway up (no configs needed)



### improvements:

use claude, move rendering engine into a cf worker, use improved tool calling with ai sdk
