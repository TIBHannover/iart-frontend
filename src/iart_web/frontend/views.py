# TODO
import sys
import os
import json
import uuid

import imageio
import numpy as np

from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, Http404
from django.conf import settings
from django.contrib import auth
from django.views.decorators.http import require_http_methods

import grpc
from iart_indexer import indexer_pb2, indexer_pb2_grpc
from iart_indexer.utils import meta_from_proto, classifier_from_proto, feature_from_proto, suggestions_from_proto

from .utils import image_normalize


def url_to_image(id):
    # todo
    return settings.MEDIA_URL + id[0:2] + "/" + id[2:4] + "/" + id + ".jpg"


def url_to_preview(id):
    # todo
    return settings.MEDIA_URL + id[0:2] + "/" + id[2:4] + "/" + id + "_m.jpg"


def index_view(request):

    context = {}
    return render(request, "index.html", context)


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

    if "queries" not in data:
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

    print("BUILD QUERY")
    for q in data["queries"]:
        print(q)

        if "type" in q and q["type"] is not None:
            type_req = q["type"]
            if not isinstance(type_req, str):
                return JsonResponse({"status": "error"})

            term = request.terms.add()
            if type_req.lower() == "meta":
                term = request.terms.add()
                term.meta.query = q["query"]
            if type_req.lower() == "annotations":
                term = request.terms.add()
                term.classifier.query = q["query"]
                request.sorting = indexer_pb2.SearchRequest.Sorting.CLASSIFIER

        elif "query" in q and q["query"] is not None:
            term = request.terms.add()
            term.meta.query = q["query"]

            term = request.terms.add()
            term.classifier.query = q["query"]

        if "reference" in q and q["reference"] is not None:
            request.sorting = indexer_pb2.SearchRequest.Sorting.FEATURE

            term = request.terms.add()
            term.feature.image.id = q["reference"]

            if "features" in q:
                plugins = q["features"]
                if not isinstance(q["features"], (list, set)):
                    plugins = [q["features"]]
                for p in plugins:
                    for k, v in p.items():
                        plugins = term.feature.plugins.add()
                        plugins.name = k.lower()
                        plugins.weight = v

    if "sorting" in data and data["sorting"] == "random":

        request.sorting = indexer_pb2.SearchRequest.Sorting.RANDOM

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

        # search is still running
        if e.code() == grpc.StatusCode.FAILED_PRECONDITION:
            return JsonResponse({"status": "running"})

    return JsonResponse({"status": "error"})


def upload(request):
    print(request)
    print(request.FILES)
    if request.method != "POST":
        return JsonResponse({"status": "error"})

    if "file" in request.FILES:
        image_id = uuid.uuid4().hex
        data = request.FILES["file"].read()
        image = image_normalize(imageio.imread(data))
        output_dir = os.path.join(settings.UPLOAD_ROOT, image_id[0:2], image_id[2:4])
        os.makedirs(output_dir, exist_ok=True)
        imageio.imwrite(os.path.join(output_dir, image_id + ".jpg"), image)

    # print(request.FILES)
    # upload_dir = os.path.join(APP_ROOT, "media", "user", "upload")
    # image_dir = os.path.join(APP_ROOT, "media", "user", "img")
    # if not os.path.exists(upload_dir):
    #     os.makedirs(upload_dir)

    # logging.info("/upload_file: new image id: {}".format(image_id))

    # json_dict = {}
    # for file in request.files.getlist("file"):
    #     fname = os.path.join(upload_dir, image_id + os.path.splitext(file.filename)[-1])
    #     file.save(fname)
    #     # convert to jpg
    #     try:
    #         # open image
    #         img = PIL.Image.open(fname)
    #         exif_data = img._getexif()

    #         # load exif data
    #         if exif_data:
    #             exif_dict = piexif.load(img.info["exif"])
    #             exif_bytes = piexif.dump(exif_dict)

    #         # resize image
    #         w, h = img.size
    #         r = min(1.0, config.max_img_dim / max(w, h))
    #         img = img.resize(size=(int(w * r + 0.5), int(h * r + 0.5)))

    #         # save image and exif data (if available)
    #         new_fname = image_id + ".jpg"
    #         if exif_data:
    #             img.save(os.path.join(image_dir, new_fname), exif=exif_bytes)
    #         else:
    #             img.save(os.path.join(image_dir, new_fname))

    #         # store json response
    #     except Exception as e:
    #         logging.info("/upload_file: {}".format(e))
    #         return jsonify(json_dict)

    #     # # convert to jpg
    #     # image = imageio.imread(fname)
    #     # imageio.imwrite(os.path.join(upload_dir, image_id + '.jpg'), image)

    #     logging.info("/upload_file: {}".format(image_id))

    #     json_dict["image_path"] = os.path.join(url_for("media"), "user", "img", image_id + ".jpg")
    #     json_dict["image_id"] = image_id

    return JsonResponse({"status": "error"})

    # if request.method == "POST" and request.FILES["myfile"]:
    #     myfile = request.FILES["myfile"]
    #     fs = FileSystemStorage(location="test/uploadedmedia")
    #     filename = fs.save(myfile.name, myfile)
    #     uploaded_file_url = fs.url(filename)
    #     return render(
    #         request, "upload.html", {"uploaded_file_url": uploaded_file_url, "fileupload": "File uploaded successfully"}
    #     )
    # return render(request, "upload.html")
