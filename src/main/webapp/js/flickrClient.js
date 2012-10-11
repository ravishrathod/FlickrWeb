var FlickrClient = {
		apiKey : "6f4baf862f03c499afcd7a4589f5b791"
};
var SetsView = Backbone.View.extend({
	
	initialize : function (options) {
		this.setsCollection = options.setsCollection;
		this.photoCollection = options.photoCollection;
	},
	
	events : {
		'click #search' : 'doSearch',
		'click .setlink' : 'browsePhotoSet',
		'submit #searchForm' : 'doSearch'
	},
	
	doSearch : function(e) {
		e.preventDefault();
		this.doSearchForUsername($('#username').val());
	},
	
	doSearchForUsername : function(username) {
		this.setsCollection.fetch({username : username, success: this.renderPhotosetList});
	},
	
	renderPhotosetList : function(setsCollection) {
		var photoSets = setsCollection.at(0).get('photosets')['photoset'];
		var strhtml = _.template($('#photoAblumTemplate').html(), {sets : photoSets});
		$('#container').html(strhtml);
		
		/*Backbone.history.start({
	        pushState: true,
	        root: '/search/'
		});*/
		
	},
	
	browsePhotoSet : function(e) {
		var link = $(e.target);
		var photosetId = $(link).attr('data_setid');
		this.fetchPhotos(photosetId);
	},
	
	fetchPhotos : function(photosetId){
		this.photoCollection.fetch({ data :{'photoset_id' : photosetId}, success : this.renderPhotoSetView});
	},
	
	renderPhotoSetView : function(photoCollection) {
		var photos = (photoCollection.toJSON())[0].photoset.photo;
		var strhtml = _.template($('#photosetTemplate').html(), {photos : photos});
		$('#container').html(strhtml);
	}
	
});

var SetModel = Backbone.Model.extend({
	
});

var SetsCollection = Backbone.Collection.extend({
	
	model : SetModel,

	initialize : function(models, options) {
		this.userid = '';
		//this.view = options.view;
		this.url = 'http://api.flickr.com/services/rest/?method=flickr.photosets.getList&api_key='+FlickrClient.apiKey+'&format=json&nojsoncallback=1';
		this.userNameApiUrl = 'http://api.flickr.com/services/rest/?method=flickr.people.findByUsername&api_key='+FlickrClient.apiKey+'&format=json&nojsoncallback=1';
	},
	
	sync : function(method, model, options) {
		
		var that = this;
		that.userName = options.username;
		
		$.ajax({
			url : this.userNameApiUrl,
			dataType : 'json',
			data : {username : options.username},
			async : false,
			success : function(data) {
				if(data.stat === 'ok') {
					that.userid = data.user.id;
				}
			}
		});
		
		delete options.username;
		
		_.extend(options, {
            url: this.url,
            dataType: 'json',
            data: { 'user_id': this.userid }/*,
            success :this.view.renderPhotosetList,
            error :this.view.renderPhotosetList*/
        });
		
		return $.ajax(options);
	}
	
});

var PhotoModel = Backbone.Model.extend({
	
});

var PhotoCollection = Backbone.Collection.extend({
	
	model : PhotoModel,
	
	initialize : function (models, options) {
		this.url = 'http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key='+FlickrClient.apiKey+'&extras=url_s,url_l,url_m&format=json&nojsoncallback=1';
	}
});

var FlickrRouter = Backbone.Router.extend({
	
	initialize : function() {
		var photoCollection = new PhotoCollection();
		var setsCollection = new SetsCollection();
		setsCollection.bind('reset', this.updateUrl, this);
		photoCollection.bind('reset', this.updateBrowseCollectionUrl, this);
		
		this.setsView = new SetsView({el : $(document), photoCollection:photoCollection, setsCollection:setsCollection});
		
		Backbone.history.start();
		
	},
	
	routes : {
		':user' : 'search',
		':user/photos/:setid' : 'exploreSet'
	},
	
	search : function (username) {
		if(username != '')
			this.setsView.doSearchForUsername(username);
	},
	
	exploreSet : function (username, setid) {
		this.setsView.fetchPhotos(options.data.photoset_id);
	},
	
	updateUrl : function(collection) {
		this.navigate(collection.userName);
	},
	
	updateBrowseCollectionUrl : function(collection, options) {
		this.navigate(options.data.photoset_id);
	}
	
});


$(document).ready(function() {
	//setsView = new SetsView({el : $(document)});
	flickrRouter = new FlickrRouter();
	
});