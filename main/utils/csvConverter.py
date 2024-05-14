import csv
import io
from main import models


def createComidaFromCsv(file):
    print(file)
    if file:
        with open("name.txt", "wb+") as destination:
            for chunk in file.chunks():
                destination.write(chunk)
    else:
        print('Empty')
