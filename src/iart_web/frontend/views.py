# TODO
import sys
import os

import numpy as np

from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, Http404
from django.conf import settings
from django.contrib import auth
from django.views.decorators.http import require_http_methods

# from iart_indexer.database.elasticsearch_database import ElasticSearchDatabase
# from iart_indexer.database.elasticsearch_suggester import ElasticSearchSuggester

import grpc
from iart_indexer import indexer_pb2, indexer_pb2_grpc
from iart_indexer.utils import meta_from_proto, classifier_from_proto, feature_from_proto, suggestions_from_proto

import json


def url_to_image(id):
    # todo
    return settings.MEDIA_URL + id[0:2] + "/" + id[2:4] + "/" + id + ".jpg"


def url_to_preview(id):
    # todo
    return settings.MEDIA_URL + id[0:2] + "/" + id[2:4] + "/" + id + "_m.jpg"


def index_view(request):

    context = {}
    return render(request, "index.html", context)


#
# def list_view(request):
#     context = {'query': json.dumps({'tag': 'landscape'})}
#     return render(request, 'list.html', context)


def details_view(request):
    if not request.is_ajax():
        return Http404()

    if "id" not in request.POST:
        # TODO error
        return JsonResponse({"status": "error"})

    id = request.POST["id"]
    entry = db.get_entry(id)
    entry["path"] = url_to_image(entry["id"])
    context = {"status": "ok", "entry": entry, "entry_json": json.dumps(entry)}
    return JsonResponse(context)


def autocomplete_view(request):
    # if not request.is_ajax():
    # return Http404()

    try:
        data = json.loads(request.body)
    except:
        return JsonResponse({"status": "error"})

    if "query" not in data:
        # TODO error
        return JsonResponse({"status": "error"})

    query = data["query"]

    host = "localhost"
    port = 50051
    channel = grpc.insecure_channel(
        f"{host}:{port}",
        options=[
            ("grpc.max_send_message_length", 50 * 1024 * 1024),
            ("grpc.max_receive_message_length", 50 * 1024 * 1024),
        ],
    )

    stub = indexer_pb2_grpc.IndexerStub(channel)
    request = indexer_pb2.SuggestRequest(query=query)
    response = stub.suggest(request)
    print(response)
    context = {"status": "ok", "suggestions": suggestions_from_proto(response)}

    return JsonResponse(context)


def search_view(request):
    #
    # if not request.is_ajax():
    #     return Http404()

    try:
        data = json.loads(request.body)
        print(data)
    except:
        print("kein json")
        return JsonResponse({"status": "error"})
    host = "localhost"
    port = 50051
    channel = grpc.insecure_channel(
        f"{host}:{port}",
        options=[
            ("grpc.max_send_message_length", 50 * 1024 * 1024),
            ("grpc.max_receive_message_length", 50 * 1024 * 1024),
        ],
    )
    stub = indexer_pb2_grpc.IndexerStub(channel)
    request = indexer_pb2.SearchRequest()

    category = None
    if "category" in data and data["category"] is not None:
        category_req = data["category"]
        if not isinstance(category_req, str):
            return JsonResponse({"status": "error"})

        if category_req.lower() == "meta":
            term.meta.query = data["query"]
        if category_req.lower() == "annotations":
            term.classifier.query = data["query"]
            request.sorting = indexer_pb2.SearchRequest.Sorting.CLASSIFIER

    elif "query" in data and data["query"] is not None:
        term = request.terms.add()
        term.meta.query = data["query"]

        term = request.terms.add()
        term.classifier.query = data["query"]

    if "id" in data and data["id"] is not None:
        request.sorting = indexer_pb2.SearchRequest.Sorting.FEATURE

        term = request.terms.add()
        term.feature.image.id = data["id"]

        if "features" in data:
            plugins = data["features"]
            if not isinstance(data["features"], (list, set)):
                plugins = [data["features"]]
            print(data["features"])
            for p in plugins:
                for k, v in p.items():
                    plugins = term.feature.plugins.add()
                    plugins.name = k.lower()
                    plugins.weight = v

    response = stub.search(request)

    return JsonResponse({"status": "ok", "job_id": response.id})


def search_result_view(request):
    #
    # if not request.is_ajax():
    #     return Http404()

    try:
        data = json.loads(request.body)
        print(data)
    except:
        print("kein json")
        return JsonResponse({"status": "error"})
    host = "localhost"
    port = 50051
    channel = grpc.insecure_channel(
        f"{host}:{port}",
        options=[
            ("grpc.max_send_message_length", 50 * 1024 * 1024),
            ("grpc.max_receive_message_length", 50 * 1024 * 1024),
        ],
    )
    stub = indexer_pb2_grpc.IndexerStub(channel)

    if "id" not in data:
        return JsonResponse({"status": "error"})

    request = indexer_pb2.ListSearchResultRequest(id=data["id"])

    try:
        response = stub.list_search_result(request)
        entries = []
        for e in response.entries:
            entry = {"id": e.id}

            entry["meta"] = meta_from_proto(e.meta)
            entry["origin"] = meta_from_proto(e.origin)
            entry["classifier"] = classifier_from_proto(e.classifier)
            entry["feature"] = feature_from_proto(e.feature)

            entry["path"] = url_to_preview(e.id)

            entries.append(entry)
        return JsonResponse({"status": "ok", "entries": entries})
    except grpc.RpcError as e:
        print(e)
    return JsonResponse({"status": "error"})


def upload(request):
    if request.method == "POST" and request.FILES["myfile"]:
        myfile = request.FILES["myfile"]
        fs = FileSystemStorage(location="test/uploadedmedia")
        filename = fs.save(myfile.name, myfile)
        uploaded_file_url = fs.url(filename)
        return render(
            request, "upload.html", {"uploaded_file_url": uploaded_file_url, "fileupload": "File uploaded successfully"}
        )
    return render(request, "upload.html")
