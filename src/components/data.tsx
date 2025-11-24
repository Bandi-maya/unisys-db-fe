export const initialData = {
  users: {
    path: "users",
    documents: {
      user123: {
        name: "Vignesh",
        age: 25,
        collections: {
          posts: {
            path: "users/user123/posts",
            documents: {
              postA: {
                title: "My post",
                content: "Hello world",
                collections: {
                  comments: {
                    path: "users/user123/posts/postA/comments",
                    documents: {
                      c1: {
                        text: "Nice post!",
                        collections: {}
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
