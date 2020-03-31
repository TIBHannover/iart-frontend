from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, Http404
from django.conf import settings

# TODO
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
from database.elasticsearch_database import ElasticSearchDatabase
from database.elasticsearch_suggester import ElasticSearchSuggester

import json

# def relative_media_url(path):
#     # todo
#     index = path.rfind('/media/')
#     return path[index:]


def relative_media_url(path):
    hash_value = os.path.splitext(os.path.basename(path))[0]
    # todo
    index = path.rfind('/media/') + len('/media/')
    return settings.MEDIA_URL + hash_value[0:2] + '/' + hash_value[2:4] + '/' + hash_value + '.jpg'


def index_view(request):
    db = ElasticSearchDatabase()
    entries = db.search(classifiers=['landscape'], sort='classifier', size=5)
    # latest_question_list = Question.objects.order_by('-pub_date')[:5]

    # TODO fix path
    entries = list(entries)
    for i, entry in enumerate(entries):
        entries[i]['path'] = relative_media_url(entry['path'])
    context = {'query': 'landscape', 'category': None, 'entries': entries, 'entries_json': json.dumps(entries)}
    return render(request, 'new_index.html', context)


#
# def list_view(request):
#     context = {'query': json.dumps({'tag': 'landscape'})}
#     return render(request, 'list.html', context)


def details_view(request):
    if not request.is_ajax():
        return Http404()

    if 'id' not in request.POST:
        #TODO error
        return JsonResponse({'status': 'error'})

    id = request.POST['id']
    db = ElasticSearchDatabase()
    entry = db.get_entry(id)
    entry['path'] = relative_media_url(entry['path'])
    context = {'status': 'ok', 'entry': entry, 'entry_json': json.dumps(entry)}
    return JsonResponse(context)


def autocomplete_view(request):
    # if not request.is_ajax():
    #     return Http404()

    try:
        data = json.loads(request.body)
    except:
        return JsonResponse({'status': 'error'})

    if 'query' not in data:
        #TODO error
        return JsonResponse({'status': 'error'})

    query = data['query']
    print(query)
    suggester = ElasticSearchSuggester()
    autocompletion = suggester.complete(query)

    # todo filter features
    autocompletion = [entry for entry in autocompletion if entry['type'] != 'features']
    print(autocompletion)
    context = {'status': 'ok', 'autocompletion': autocompletion, 'autocompletion_json': json.dumps(autocompletion)}
    print('search6')
    return JsonResponse(context)


def search_view(request):
    #
    # if not request.is_ajax():
    #     return Http404()

    print('search')
    try:
        data = json.loads(request.body)
    except:
        print('kein json')
        return JsonResponse({'status': 'error'})

    if 'query' not in data:
        #TODO error
        print('kein query')
        return JsonResponse({'status': 'error'})

    print('search-')

    print(data)
    category = None
    if 'category' in data and data['category'] is not None:
        category_req = data['category']
        if not isinstance(category_req, str):
            return JsonResponse({'status': 'error'})

        if category_req.lower() == 'meta':
            category = 'meta'
        if category_req.lower() == 'annotations':
            category = 'annotations'

    print(data)
    query = data['query']

    if isinstance(query, (list, set)):
        query = query[0]

    db = ElasticSearchDatabase()

    print('#####################################################')
    print('#####################################################')
    print('#####################################################')
    if category == 'annotations':
        print('classifiers')
        entries = db.search(classifiers=query, sort='classifier', size=100)

    if category == 'meta':
        print('meta')
        entries = db.search(meta=query, size=100)

    if category is None:
        print('none')
        entries = db.search(meta=query, classifiers=query, size=100)

    entries = list(entries)

    for i, entry in enumerate(entries):
        entries[i]['path'] = relative_media_url(entry['path'])
    context = {'status': 'ok', 'entries': entries, 'entries_json': json.dumps(entries)}
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
