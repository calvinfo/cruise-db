
# cruise-db

  A reference k/v store based upon [cruise][cruise]. It's the javascript analog to [`goraft/raftd`][raftd].

[cruise]: https://github.com/calvinfo/cruise
[raftd]: https://github.com/goraft/raftd

## Usage

  To get a server running you'll want to run the server:


    $ npm install -g cruise-db
    $ cruise-db --port 4001
    listening on 4001...

  Then you can store values by posting to `/db/:key`

    $ curl http://localhost:4001/db/some-key \
        -X POST \
        --data 'foo=bar'

  And get them back from `/db/:key`

    $ curl http://localhost:4001/db/some-key
    {"foo":"bar"}

## Clustering

  Since the whole point of raft is consensus among a distributed system, the reference db can be run as a cluster. Simply pass the `--join [-j]` option with the connection string of the leader to add servers to the cluster

    $ cruise-db
    Listening on 4001...

    $ cruise-db --port 4002 --join localhost:4001
    Listening on 4002...

    $ cruise-db --port 4003 --join localhost:4001
    Listening on 4003...

  You can wuery keyes from the followers and they should stay in sync with any new keys posted to the leader.


## Caveats

  Just like raftd, the system does not do any sort of client forwarding. In order to submit new commands, you will have to post them to the leader node.

## License

(The MIT License)

Copyright (c) 2014 Calvin French-Owen &lt;calvin@calv.info&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.