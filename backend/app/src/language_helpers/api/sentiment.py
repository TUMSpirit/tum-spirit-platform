from ...utils.db import get_db

metadata_collection = get_db("chat_metadata")

def get_sentiment(userId, startDate=None, endDate=None):
    #TODO: conversion to list might break with large dataset, everything needs to be pulled into ram..

    filter_by = {"sender_id": userId}

    # filter start & end Date
    if startDate and endDate:
        filter_by["timestamp"] = {"$gt": startDate, "$lt": endDate}
    

    result = metadata_collection.find(
        filter_by, 
        {"_id": 0, "metadata": {"sentiment": 1}, "timestamp": 1})
    result_list = [{"date": entry["timestamp"], "sentiment": entry["metadata"]["sentiment"]} for entry in result]

    return result_list