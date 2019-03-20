# AgensGraph viewer UI

This package provides basic web UI and node.js backend to work with [AgensGraph](https://github.com/bitnine-oss/agensgraph-docker/tree/master/AgensGraph) using [*Cypher*](https://www.opencypher.org/about) query language.

![Screenshot of version 0.1.4](https://raw.githubusercontent.com/mrjj/agens-viewer/HEAD/doc/screenshot_0.1.4_01.png)

## How to use

Installation and basic run example:

```bash
$ npm install -g agens-viewer
$ agensv
```

Example of advanced run with customized env:

```bash
$ export PORT=7001 \
    HOST=0.0.0.0 \
    AGENS_PORT=7432 \
    AGENS_HOST=0.0.0.0 \
    AGENS_USER=myuser \
    AGENS_PASSWORD=mypassword \
    AGENS_DATABASE=mydatabase \
    AGENS_GRAPH_NAME=myagens_graph && \ 
  agensv
```

Development setup and running in watch mode:

```bash
$ git clone https://github.com/mrjj/agens-viewer.git
$ cd  agens-viewer
$ npm install
$ npm run dev
$ open 'http://0.0.0.0:1313'

```

Local instance will be executed with UI on [http://0.0.0.0:1313](http://0.0.0.0:1313).

## Owl

```
   ◯  .       .        .           .     *     .
 .  .     .      ___---===(OvO)===---___  .      °     *
                  .              
,~^~,   .      .     ◯         .            .      ,~^~^^                
    ~^\$~^~~^#*~-^\_  __ _ _ _ _ ____/*-~^~~^^~^##~^~^
                  = * - _-  =_- . - 
```
