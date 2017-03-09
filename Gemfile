source 'https://rubygems.org'

branch = ENV.fetch('SOLIDUS_BRANCH', 'master')
gem 'solidus', github: 'solidusio/solidus', branch: branch
gem 'solidus_auth_devise'

if branch == 'master' || branch >= 'v2.0'
  gem 'rails-controller-testing', group: :test
else
  gem 'rails', '~> 4.2.7'
end

gem 'mysql2'
gem 'pg'

group :development, :test do
  gem 'pry-rails'
end

gemspec
