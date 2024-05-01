# openanimator

client is a nextjs ai sdk frontend, reqs: auth0 auth, server runs independently on a dedicated machine (railway)


https://github.com/sdan/openanimator/assets/22898443/332eef0b-0e1d-4c86-bf10-ed4d4355e980


server is a python server that takes manim code and renders it, reqs: public endpoint

## how to run

frontend: cd client, vc dev (need to add .env and various <variables>
backend: cd server, python main.py, railway up (no configs needed)



### improvements:

move rendering engine into a cf worker, use improved tool calling with ai sdk
