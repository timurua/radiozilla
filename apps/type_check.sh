#!/bin/sh

(cd pysrc && export PYTHONPATH=..:.:$PYTHONPATH && mypy .) &
(cd apiservice && export PYTHONPATH=..:.:$PYTHONPATH && mypy .) &
(cd dbjob && export PYTHONPATH=..:.:$PYTHONPATH && mypy .) &
(cd scraperjob && export PYTHONPATH=..:.:$PYTHONPATH && mypy .) &
(cd summarizerjob && export PYTHONPATH=..:.:$PYTHONPATH && mypy .) &
(cd ttsjob && export PYTHONPATH=..:.:$PYTHONPATH && mypy .) &
(cd publisherjob && export PYTHONPATH=..:.:$PYTHONPATH && mypy .) &

# Wait for all background processes to complete
wait
