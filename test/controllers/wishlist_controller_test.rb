require "test_helper"

class WishlistControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get wishlist_index_url
    assert_response :success
  end
end
