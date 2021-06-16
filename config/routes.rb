Rails.application.routes.draw do
  get '/wishlist', to: "wishlist#index"
  get '/about', to: "about#index"
  get '/crypto/:id', to: "coin#index", as: 'coin'
  get '/coins', to: "crypto#index"
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  root :to => "home#index"
end
