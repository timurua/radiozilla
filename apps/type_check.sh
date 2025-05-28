#!/bin/sh

(cd pysrc && export PYTHONPATH=..:.:$PYTHONPATH && mypy . 2>&1 | sed 's/^/pysrc: /') &
(cd apiservice && export PYTHONPATH=..:.:$PYTHONPATH && mypy . 2>&1 | sed 's/^/apiservice: /') &
(cd dbjob && export PYTHONPATH=..:.:$PYTHONPATH && mypy . 2>&1 | sed 's/^/dbjob: /') &
(cd scraperjob && export PYTHONPATH=..:.:$PYTHONPATH && mypy . 2>&1 | sed 's/^/scraperjob: /') &
(cd summarizerjob && export PYTHONPATH=..:.:$PYTHONPATH && mypy . 2>&1 | sed 's/^/summarizerjob: /') &
(cd ttsjob && export PYTHONPATH=..:.:$PYTHONPATH && mypy . 2>&1 | sed 's/^/ttsjob: /') &
(cd publisherjob && export PYTHONPATH=..:.:$PYTHONPATH && mypy . 2>&1 | sed 's/^/publisherjob: /') &

# Wait for all background processes to complete
wait
