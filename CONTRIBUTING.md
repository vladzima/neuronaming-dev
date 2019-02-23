# How to contribute

Please keep in mind, that initial version was create in 2015, so there could be outdates dependencies and such. Also, the model approach is pretty old, so any contribution to the ML part is highly appreciated.

## Data available

1) An archive of every checkpoint of model training for each category (heavy lifting alert: ~3.5GB) is available [here](https://storage.googleapis.com/nnnet_storage/cv_full.cpgz).
2) Initial pre-processed training data (list of UK business names by category) in CSV format is available [here](https://storage.googleapis.com/nnnet_storage/data.cpgz).

## Submitting changes

Please send a [GitHub Pull Request to neuronaming-dev](https://github.com/vladzima/neuronaming-dev/pull/new/master) with a clear list of what you've done (read more about [pull requests](http://help.github.com/pull-requests/)).

Always write a clear log message for your commits. One-line messages are fine for small changes, but bigger changes should look like this:

    $ git commit -m "A brief summary of the commit
    > 
    > A paragraph describing what changed and its impact."
