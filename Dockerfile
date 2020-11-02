FROM iart/indexer

COPY /pyproject.toml /src /web/

#COPY /indexer/pyproject.toml /indexer/src /indexer/
#RUN ls /
#RUN pip install /indexer
RUN pip install /web
CMD python -m iart_web runserver  0.0.0.0:8000
