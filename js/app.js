const PostList = {
    template: "#post-list",
    mounted: function() {
        this.$root.scrollTop();
    }
}
const Page = {
    template: "#page",
    methods: {
        setPost: function() {
            var arr = this.$root.pages,
                slug = this.$route.params.slug;

            if (!arr.length) {
                return;
            }
            var app = this.$root;

            _.forEach(arr, function(page) {
                if (page.fields.slug === slug) {
                    app.selectedPage = page;
                }
            });
        }
    },
    mounted: function() {
        this.$root.scrollTop();
        this.setPost();
    },
    watch: {
        "$route": function() {
            this.setPost();
        },
        "$root.posts": function() {
            this.setPost();
        }
    }
}
const Post = {
    template: "#post",
    methods: {
        setPost: function() {
            var arr = this.$root.posts,
                slug = this.$route.params.slug;

            if (!arr.length) {
                return;
            }
            var app = this.$root;

            _.forEach(arr, function(post, i) {
                if (post.fields.slug === slug) {
                    app.selectedPost = post;
                    app.previousPost = arr[i - 1];
                    app.nextPost = arr[i + 1];
                }
            });
        }
    },
    mounted: function() {
        this.$root.scrollTop();
        this.setPost();
    },
    watch: {
        "$route": function() {
            var _this = this;

            setTimeout(function() {
                _this.setPost();
                window.scrollTo(0, 0);
            },300);
        },
        "$root.posts": function() {
            this.setPost();
        }
    }
}
const Category = {
    template: "#category",
    methods: {
        getList: function() {
            var app = this.$root,
                slug = this.$route.params.slug,
                categoryID,
                fetchArgs = {
                    method: "GET",
                    mode: "cors"
                };

            _.forEach(app.entries, function(category) {
                if (category.fields.title) {
                    var catID = category.fields.title.toLowerCase();

                    if (catID == slug) {
                        app.selectedCategory = category.fields.title;
                        categoryID = category.sys.id;
                    }
                }
            });

            fetch(app.postsUrl + app.categoriesUrl + categoryID, fetchArgs).then(function(response){
                return response.json();
            })
            .then(function(response) {
                app.categoryList = response.items;
                app.categoryList = _.orderBy(app.categoryList, function(e) { return e.fields.date }, 'desc');
            });
        }
    },
    mounted: function() {
        this.$root.scrollTop();
        this.$root.categoryList = [];
        this.getList();
    },
    watch: {
        "$route": function() {
            this.$root.categoryList = [];
            this.getList();
        },
        "$root.posts": function() {
            this.$root.categoryList = [];
            this.getList();
        }
    }
}

const routes = [
  { path: '/', component: PostList },
  { path: '/page/:slug', component: Page },
  { path: '/:slug', component: Post },
  { path: '/category/:slug', component: Category }
];

const router = new VueRouter({routes});

const app = new Vue({
    router,
    el: "#app",
    data: {
        postsUrl: "https://cdn.contentful.com/spaces/cqlwgll2y3f0/entries?access_token=b741a7c96c34f068cd8a01b7b774e316db05009ab23fcfbf0292d3d253b649bf&content_type=blogPost",
        pagesUrl: "https://cdn.contentful.com/spaces/cqlwgll2y3f0/entries?access_token=b741a7c96c34f068cd8a01b7b774e316db05009ab23fcfbf0292d3d253b649bf&content_type=page",
        categoriesUrl: "&fields.categories.sys.id[match]=",
        posts: [],
        pages: [],
        selectedCategory: "",
        categoryList: [],
        selectedPost: {
            "fields": {
                "slug": "",
                "featuredImage": {
                    "sys": ""
                }
            },
        },
        previousPost: {
            "fields": {
                "slug": "",
                "featuredImage": {
                    "sys": ""
                }
            },
        },
        nextPost: {
            "fields": {
                "slug": "",
                "featuredImage": {
                    "sys": ""
                }
            },
        },
        selectedPage: {
            "fields" :{}
        },
        assets: [],
        entries: [],
        pageAssets: [],
        pageEntries: []
    },
    methods: {
        scrollTop: function() {
            window.scrollTo(0, 0);
        },
        getApiData: function(url) {
            var _this = this,
                fetchArgs = {
                    method: "GET",
                    mode: "cors"
                };

            fetch(_this.postsUrl, fetchArgs).then(function(response){
                return response.json();
            })
            .then(function(response) {
                _this.posts = response.items;
                _this.assets = response.includes.Asset;
                _this.entries = response.includes.Entry;
                _this.posts = _.orderBy(_this.posts, function(e) { return e.fields.date }, 'desc');
            });

            fetch(_this.pagesUrl, fetchArgs).then(function(response){
                return response.json();
            })
            .then(function(response) {
                _this.pages = response.items;
                _this.pageAssets = response.includes.Asset;
                _this.pageEntries = response.includes.Entry;
            });
        },
        formatDate: function(val, format) {
            if (val) {
                var date = new Date(val);
                return moment(date).format(format);
            }
        },
        postLink: function(val) {
            if (val) {
                return "/" + val;
            }
        },
        postImage: function(id) {
            var _this = this;
            var imageURL;
            _.forEach(_this.assets, function(asset) {
                if (asset.sys.id == id) {
                    imageURL = asset.fields.file.url;
                }
            });
            return imageURL;
        },
        categoryName: function(id) {
            var _this = this;
            var categoryTitle;
            _.forEach(_this.entries, function(category) {
                if (category.sys.id == id) {
                    categoryTitle = category.fields.title;
                }
            });
            return categoryTitle;
        },
        categoryLink: function(id) {
            var _this = this;
            var categoryTitle;
            _.forEach(_this.entries, function(category) {
                if (category.sys.id == id) {
                    categoryTitle = category.fields.title;
                }
            });
            if (categoryTitle) {
                return "/category/" + categoryTitle.toLowerCase();
            }
        },
        renderMarkdown: function(content) {
            var converter = new showdown.Converter();

            return converter.makeHtml(content);
        },
        upSwipe: function() {
            var el = document.querySelectorAll("body");

            if (el.classList) {
                el[0].classList.add("page-swipe-up");
            } else {
                el[0].className += ' ' + "page-swipe-up";
            }

            setTimeout(function() {
                if (el.classList) {
                    el[0].classList.remove("page-swipe-up");
                } else {
                    el[0].className = el[0].className.replace(new RegExp('(^|\\b)' + "page-swipe-up".split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
                }
            },600);
        },
        downSwipe: function() {
            var el = document.querySelectorAll("body");

            if (el.classList) {
                el[0].classList.add("page-swipe-down");
            } else {
                el[0].className += ' ' + "page-swipe-down";
            }

            setTimeout(function() {
                if (el.classList) {
                    el[0].classList.remove("page-swipe-down");
                } else {
                    el[0].className = el[0].className.replace(new RegExp('(^|\\b)' + "page-swipe-down".split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
                }
            },600);
        },
        navigatePrevious: function() {
            var el = document.querySelectorAll("body");

            if (el.classList) {
                el[0].classList.add("page-swipe-left");
            } else {
                el[0].className += ' ' + "page-swipe-left";
            }

            setTimeout(function() {
                if (el.classList) {
                    el[0].classList.remove("page-swipe-left");
                } else {
                    el[0].className = el[0].className.replace(new RegExp('(^|\\b)' + "page-swipe-left".split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
                }
            },600);
        },
        navigateNext: function() {
            var el = document.querySelectorAll("body");

            if (el.classList) {
                el[0].classList.add("page-swipe-right");
            } else {
                el[0].className += ' ' + "page-swipe-right";
            }

            setTimeout(function() {
                if (el.classList) {
                    el[0].classList.remove("page-swipe-right");
                } else {
                    el[0].className = el[0].className.replace(new RegExp('(^|\\b)' + "page-swipe-right".split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
                }
            },600);
        }
    },
    created: function() {
        this.getApiData();
    }
});
