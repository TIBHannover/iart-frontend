from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, Http404

# TODO
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
from database.elasticsearch_database import ElasticSearchDatabase

import json


def relative_media_path(path):
    # todo
    index = path.rfind('/media/')
    return path[index:]


def index_view(request):
    db = ElasticSearchDatabase()
    entries = db.search({"query": {"match": {"classifier.annotations.name": "landscape"}}}, size=100)
    # latest_question_list = Question.objects.order_by('-pub_date')[:5]

    # TODO fix path
    entries = list(entries)
    for i, entry in enumerate(entries):
        entries[i]['path'] = relative_media_path(entry['path'])
    context = {'entries': entries, 'entries_json': json.dumps(entries)}
    return render(request, 'index.html', context)


def list_view(request):
    context = {'query': json.dumps({'tag': 'landscape'})}
    return render(request, 'list.html', context)


def search_view(request):
    print('search1')

    if not request.is_ajax():
        return

    print('search2')
    db = ElasticSearchDatabase()
    entries = db.search({"query": {"match": {"classifier.annotations.name": "landscape"}}}, size=200)

    print('search3')
    entries = list(entries)

    print('search4')
    for i, entry in enumerate(entries):
        entries[i]['path'] = relative_media_path(entry['path'])
    print('search5')
    context = {'status': 'ok', 'entries': entries, 'entries_json': json.dumps(entries)}
    print('search6')
    return JsonResponse(context)


def upload(request):
    if request.method == 'POST' and request.FILES['myfile']:
        myfile = request.FILES['myfile']
        fs = FileSystemStorage(location="test/uploadedmedia")
        filename = fs.save(myfile.name, myfile)
        uploaded_file_url = fs.url(filename)
        return render(request, 'upload.html', {
            'uploaded_file_url': uploaded_file_url,
            "fileupload": "File uploaded successfully"
        })
    return render(request, 'upload.html')
