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
from iart_indexer.utils import meta_from_proto, classifier_from_proto, feature_from_proto

print(indexer_pb2.__file__)

from elasticsearch import Elasticsearch, exceptions


class ElasticSearchDatabase:
    def __init__(self, config: dict = None):
        if config is None:
            config = {}

        self.hosts = config.get("host", "localhost")
        self.port = config.get("port", 9200)

        self.es = Elasticsearch([{"host": self.hosts, "port": self.port}])

        self.index = config.get("index", "iart")
        self.type = config.get("type", "_doc")

        if not self.es.indices.exists(index=self.index):
            # pass
            request_body = {
                "mappings": {
                    "properties": {
                        "classifier": {
                            "type": "nested",
                            "properties": {
                                "annotations": {
                                    "type": "nested",
                                    "properties": {
                                        "name": {
                                            "type": "text",
                                            "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                                        },
                                        "type": {
                                            "type": "text",
                                            "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                                        },
                                        "value": {"type": "float"},
                                        "value_64": {"type": "dense_vector", "dims": 64},
                                        "value_256": {"type": "dense_vector", "dims": 256},
                                    },
                                },
                                "plugin": {
                                    "type": "text",
                                    "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                                },
                                "version": {"type": "float"},
                            },
                        },
                        "feature": {
                            "type": "nested",
                            "properties": {
                                "annotations": {
                                    "type": "nested",
                                    "properties": {
                                        "hash": {
                                            "properties": {
                                                "split_0": {
                                                    "type": "text",
                                                    "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                                                },
                                                "split_1": {
                                                    "type": "text",
                                                    "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                                                },
                                                "split_2": {
                                                    "type": "text",
                                                    "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                                                },
                                                "split_3": {
                                                    "type": "text",
                                                    "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                                                },
                                            }
                                        },
                                        "type": {
                                            "type": "text",
                                            "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                                        },
                                        "value": {"type": "float"},
                                    },
                                },
                                "plugin": {
                                    "type": "text",
                                    "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                                },
                                "version": {"type": "float"},
                            },
                        },
                        "filename": {"type": "text", "fields": {"keyword": {"type": "keyword", "ignore_above": 256}}},
                        "id": {"type": "text", "fields": {"keyword": {"type": "keyword", "ignore_above": 256}}},
                        "image": {"properties": {"height": {"type": "long"}, "width": {"type": "long"}}},
                        "meta": {
                            "properties": {
                                "artist_hash": {
                                    "type": "text",
                                    "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                                },
                                "artist_name": {
                                    "type": "text",
                                    "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                                },
                                "institution": {
                                    "type": "text",
                                    "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                                },
                                "location": {
                                    "type": "text",
                                    "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                                },
                                "title": {
                                    "type": "text",
                                    "fields": {"keyword": {"type": "keyword", "ignore_above": 256}},
                                },
                                "yaer_max": {"type": "long"},
                                "year_min": {"type": "long"},
                            }
                        },
                        "path": {"type": "text", "fields": {"keyword": {"type": "keyword", "ignore_above": 256}}},
                    }
                }
            }

            self.es.indices.create(index=self.index, body=request_body)

    def insert_entry(self, hash_id, doc):
        self.es.index(index=self.index, doc_type=self.type, id=hash_id, body=doc)

    def update_entry(self, hash_id, doc):
        self.es.update(index=self.index, doc_type=self.type, id=hash_id, body={"doc": doc})

    def get_entry(self, hash_id):
        try:
            return self.es.get(index=self.index, doc_type=self.type, id=hash_id)["_source"]
        except exceptions.NotFoundError:
            return None

    def update_plugin(self, hash_id, plugin_name, plugin_version, plugin_type, annotations):
        entry = self.get_entry(hash_id=hash_id)
        if entry is None:
            # TODO logging
            return

        # convert protobuf to dict
        annotations_list = []
        for anno in annotations:
            result_type = anno.WhichOneof("result")
            if result_type == "feature":
                annotation_dict = {}
                binary = anno.feature.binary
                feature = list(anno.feature.feature)

                annotation_dict["value"] = feature

                hash_splits_list = []
                for x in range(4):
                    hash_splits_list.append(binary[x * len(binary) // 4 : (x + 1) * len(binary) // 4])
                annotation_dict["hash"] = {f"split_{i}": x for i, x in enumerate(hash_splits_list)}
                annotation_dict["type"] = anno.feature.type

                annotations_list.append(annotation_dict)

            if result_type == "classifier":
                for concept in anno.classifier.concepts:
                    annotation_dict = {}
                    annotation_dict["name"] = concept.concept
                    annotation_dict["type"] = concept.type
                    annotation_dict["value"] = concept.prob

                    annotations_list.append(annotation_dict)

        print(annotations_list)

        # exit()
        if plugin_type in entry:
            founded = False
            for i, plugin in enumerate(entry[plugin_type]):
                if plugin["plugin"] == plugin_name:
                    founded = True
                    if plugin["version"] < plugin_version:
                        entry[plugin_type][i] = {
                            "plugin": plugin_name,
                            "version": plugin_version,
                            "annotations": annotations_list,
                        }
            if not founded:
                entry[plugin_type].append(
                    {"plugin": plugin_name, "version": plugin_version, "annotations": annotations_list}
                )
        else:
            entry.update(
                {plugin_type: [{"plugin": plugin_name, "version": plugin_version, "annotations": annotations_list}]}
            )
        self.es.index(index=self.index, doc_type=self.type, id=hash_id, body=entry)

    def search(self, meta=None, features=None, classifiers=None, sort=None, size=5):
        if not self.es.indices.exists(index=self.index):
            return []
        print("#########################")
        print(f"m:{meta} f:{features} c:{classifiers} s:{sort} #:{size}")
        print("#########################")
        terms = []

        if meta is not None:
            terms.append(
                {
                    "multi_match": {
                        "query": meta,
                        "fields": ["meta.title", "meta.author", "meta.location", "meta.institution"],
                    }
                }
            )

        if classifiers is not None:

            if not isinstance(classifiers, (list, set)):
                classifiers = [classifiers]

            classifier_should = []
            for classifier in classifiers:
                if isinstance(classifier, dict):
                    pass
                else:
                    classifier_should.append({"match": {"classifier.annotations.name": classifier}})
            terms.append(
                {
                    "nested": {
                        "path": "classifier",
                        "query": {
                            "nested": {
                                "path": "classifier.annotations",
                                "query": {"bool": {"should": classifier_should}},
                            }
                        },
                    }
                }
            )

        if features is not None:

            if not isinstance(features, (list, set)):
                features = [features]

            for feature in features:
                hash_splits = []
                for a in feature["annotations"]:
                    for sub_hash_index, value in a["hash"].items():
                        hash_splits.append(
                            {
                                "fuzzy": {
                                    f"feature.annotations.hash.{sub_hash_index}": {
                                        "value": value,
                                        "fuzziness": int(feature["fuzziness"]) if "fuzziness" in feature else 2,
                                    },
                                }
                            }
                        )

                term = {
                    "nested": {
                        "path": "feature",
                        "query": {
                            "bool": {
                                "must": [
                                    {"match": {"feature.plugin": feature["plugin"]}},
                                    {
                                        "nested": {
                                            "path": "feature.annotations",
                                            "query": {
                                                "bool": {
                                                    # "must": {"match": {"feature.plugin": "yuv_histogram_feature"}},
                                                    "should": hash_splits,
                                                    "minimum_should_match": int(feature["minimum_should_match"])
                                                    if "minimum_should_match" in feature
                                                    else 4,
                                                },
                                            },
                                        }
                                    },
                                ]
                            },
                        },
                    }
                }
                terms.append(term)
        # if features is not None:
        #     print("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFf")
        #     # for feature in features:
        #     #     print(feature)
        #     feature = features[0]["annotations"][0]
        #     # print(feature)
        #     if "val_256" in feature:
        #         script = {
        #             # "source": "randomScore(100)"
        #             "source": "cosineSimilarity(params.query_vector, 'feature.annotations.val_256') + 1.0",
        #             "params": {"query_vector": feature["val_256"]},
        #         }

        #     if "val_128" in feature:
        #         script = {
        #             # "source": "randomScore(100)"
        #             # cosineSimilarity(params.queryVector, doc['gpdcluster'])+1.0
        #             "source": "cosineSimilarity(params.query_vector, doc['feature.annotations.val_128']) + 1.0",
        #             "params": {"query_vector": feature["val_128"]},
        #         }

        #     if "val_64" in feature:
        #         script = {
        #             # "source": "randomScore(100)"
        #             "source": "(cosineSimilarity(params.query_vector, doc['feature.annotations.val_64']) + 1.0)",
        #             "params": {"query_vector": feature["val_64"]},
        #         }

        #     body = {
        #         "query": {"script_score": {"query": {"bool": {"should": terms}}, "script": script}},
        #     }

        #     print(body)

        # else:
        body = {"query": {"bool": {"should": terms}}}

        if sort is not None:
            sort_list = []
            if not isinstance(sort, (list, set)):
                sort = [sort]
            for x in sort:
                if x == "classifier":
                    sort_list.append(
                        {
                            "classifier.annotations.value": {
                                "order": "desc",
                                "nested": {"path": "classifier", "nested": {"path": "classifier.annotations"}},
                            }
                        }
                    )

            body.update({"sort": sort_list})
        print("####################################")
        print(json.dumps(body, indent=2))
        print("####################################")
        try:
            results = self.es.search(index=self.index, body=body, size=size)
            for x in results["hits"]["hits"]:
                yield x["_source"]
        except exceptions.NotFoundError:
            return []
        # self.es.update('')

    def all(self, pagesize=250, scroll_timeout="10m", **kwargs):
        if not self.es.indices.exists(index=self.index):
            return None
        is_first = True
        while True:
            # Scroll next
            if is_first:  # Initialize scroll
                result = self.es.search(index=self.index, scroll="1m", **kwargs, body={"size": pagesize})
                is_first = False
            else:
                result = self.es.scroll(body={"scroll_id": scroll_id, "scroll": scroll_timeout})
            scroll_id = result["_scroll_id"]
            hits = result["hits"]["hits"]
            # Stop after no more docs
            if not hits:
                break
            # Yield each entry
            yield from (hit["_source"] for hit in hits)

    def drop(self):
        self.es.indices.delete(index=self.index, ignore=[400, 404])


import json


def url_to_image(id):
    # todo
    return settings.MEDIA_URL + id[0:2] + "/" + id[2:4] + "/" + id + ".jpg"


def url_to_preview(id):
    # todo
    return settings.MEDIA_URL + id[0:2] + "/" + id[2:4] + "/" + id + "_m.jpg"


def index_view(request):
    db = ElasticSearchDatabase()
    entries = db.search(classifiers=["landscape"], sort="classifier", size=5)
    # latest_question_list = Question.objects.order_by('-pub_date')[:5]

    # TODO fix path
    entries = list(entries)

    print(entries)
    for i, entry in enumerate(entries):
        entries[i]["path"] = url_to_preview(entry["id"])
    context = {"query": "landscape", "category": None, "entries": entries, "entries_json": json.dumps(entries)}
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
    db = ElasticSearchDatabase()
    entry = db.get_entry(id)
    entry["path"] = url_to_image(entry["id"])
    context = {"status": "ok", "entry": entry, "entry_json": json.dumps(entry)}
    return JsonResponse(context)


def autocomplete_view(request):
    # if not request.is_ajax():
    #     return Http404()

    try:
        data = json.loads(request.body)
    except:
        return JsonResponse({"status": "error"})

    if "query" not in data:
        # TODO error
        return JsonResponse({"status": "error"})

    query = data["query"]
    print(query)
    suggester = ElasticSearchSuggester()
    autocompletion = suggester.complete(query)

    # todo filter features
    autocompletion = [entry for entry in autocompletion if entry["type"] != "features"]
    print(autocompletion)
    context = {"status": "ok", "autocompletion": autocompletion, "autocompletion_json": json.dumps(autocompletion)}
    print("search6")
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
